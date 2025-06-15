import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
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

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    console.log('Salt rounds value:', saltRounds, 'Type:', typeof saltRounds);
    
    // Ensure saltRounds is a valid number
    const validSaltRounds = Number(saltRounds);
    if (isNaN(validSaltRounds) || validSaltRounds < 1) {
      console.warn('Invalid salt rounds, using default value of 10');
      return bcrypt.hash(password, 10);
    }
    
    return bcrypt.hash(password, validSaltRounds);
  }

  private async ensureDefaultOwner() {
    const defaultEmail = this.configService.get('DEFAULT_OWNER_EMAIL');
    const defaultPassword = this.configService.get('DEFAULT_OWNER_PASSWORD');
    
    console.log('Default email:', defaultEmail);
    console.log('Default password exists:', !!defaultPassword);
    
    if (!defaultEmail || !defaultPassword) {
      console.log('Default owner credentials not configured');
      return;
    }

    try {
      const existingOwner = await this.prisma.owner.findUnique({
        where: { email: defaultEmail },
      });

      if (!existingOwner) {
        console.log('Creating default owner...');
        const hashedPassword = await this.hashPassword(defaultPassword);
        
        await this.prisma.owner.create({
          data: {
            name: 'Default Owner',
            email: defaultEmail,
            password: hashedPassword,
            phone: '000-000-0000',
          },
        });
        console.log('Default owner account created');
      } else {
        console.log('Default owner already exists');
      }
    } catch (error) {
      console.error('Error in ensureDefaultOwner:', error);
    }
  }

  async registerOwner(dto: RegisterOwnerDto) {
    // Check if owner already exists
    const existingOwner = await this.prisma.owner.findUnique({
      where: { email: dto.email },
    });

    if (existingOwner) {
      throw new UnauthorizedException('Owner with this email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

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
    // Check if member already exists
    const existingMember = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });

    if (existingMember) {
      throw new UnauthorizedException('Member with this email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

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
    console.log('Login attempt for email:', dto.email);
    
    let user: any;
    let userRole: string;
    
    // Check owner table first
    user = await this.prisma.owner.findUnique({
      where: { email: dto.email },
    });
    
    console.log('Owner found:', !!user);
    
    if (user) {
      userRole = 'OWNER';
    } else {
      // If not owner, check member table
      user = await this.prisma.member.findUnique({
        where: { email: dto.email },
      });
      userRole = user ? 'MEMBER' : '';
      console.log('Member found:', !!user);
    }

    if (!user) {
      console.log('No user found with email:', dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('User found, checking password...');
    console.log('Stored password hash:', user.password);
    console.log('Input password:', dto.password);

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if member subscription is expired
    if (userRole === 'MEMBER' && user.expiryDate && new Date() > user.expiryDate) {
      throw new UnauthorizedException('Membership has expired');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: userRole,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '3600s',
      role: userRole,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        ...(userRole === 'MEMBER' && { expiryDate: user.expiryDate }),
      },
    };
  }

  async validateUser(userId: number, role: string) {
    let user: any;

    if (role === 'OWNER') {
      user = await this.prisma.owner.findUnique({
        where: { id: userId },
      });
    } else if (role === 'MEMBER') {
      user = await this.prisma.member.findUnique({
        where: { id: userId },
      });

      // Check if membership is still active
      if (user && user.expiryDate && new Date() > user.expiryDate) {
        throw new UnauthorizedException('Membership has expired');
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}