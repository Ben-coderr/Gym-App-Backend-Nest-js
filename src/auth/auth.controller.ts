import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dtos/register-owner.dto';
import { RegisterMemberDto } from './dtos/register-member.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './guards/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-owner')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    @UsePipes(new ValidationPipe({ transform: true }))
    registerOwner(@Body() dto: RegisterOwnerDto) {
    return this.authService.registerOwner(dto);
    }

  @Post('register-member')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerMember(@Body() dto: RegisterMemberDto) {
    return this.authService.registerMember(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}