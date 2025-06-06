import { Injectable, UnauthorizedException,OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterOwnerDto } from './dtos/register-owner.dto';
import { RegisterMemberDto } from './dtos/register-member.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async onModuleInit() {
    await this.ensureDefaultOwner();
  }
  private async ensureDefaultOwner() {
    const defaultEmail = this.configService.get('DEFAULT_OWNER_EMAIL');
    const defaultPassword = this.configService.get('DEFAULT_OWNER_PASSWORD');
    
    if (!defaultEmail || !defaultPassword) return;

    const existingOwner = await this.prisma.owner.findUnique({
      where: { email: defaultEmail },
    });

    if (!existingOwner) {
      const hashedPassword = await bcrypt.hash(
        defaultPassword,
        this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
      );
      
      await this.prisma.owner.create({
        data: {
          name: 'Default Owner',
          email: defaultEmail,
          password: hashedPassword,
          phone: '000-000-0000',
        },
      });
      console.log('Default owner account created');
    }
  }

  async registerOwner(dto: RegisterOwnerDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );

    return this.prisma.owner.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
      },
    });
  }

  async registerMember(dto: RegisterMemberDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );

    return this.prisma.member.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        ownerId: +dto.ownerId, // Assuming ownerId is passed in DTO
        
      },
    });
  }

  async login(dto: LoginDto) {
    let user: any;
    
    // Check owner table
    user = await this.prisma.owner.findUnique({
      where: { email: dto.email },
    });
    
    // If not owner, check member table
    if (!user) {
      user = await this.prisma.member.findUnique({
        where: { email: dto.email },
      });
    }

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.hasOwnProperty('joinDate') ? 'MEMBER' : 'OWNER' 
    };

    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      role: payload.role,
    };
  }
}