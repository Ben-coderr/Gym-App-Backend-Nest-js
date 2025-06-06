import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check both owner and member tables
    const owner = await this.prisma.owner.findUnique({
      where: { id: payload.sub },
    });

    if (owner) {
      return { ...owner, role: 'OWNER' };
    }

    const member = await this.prisma.member.findUnique({
      where: { id: payload.sub },
    });

    if (!member) {
      return null;
    }

    return { ...member, role: 'MEMBER' };
  }
}