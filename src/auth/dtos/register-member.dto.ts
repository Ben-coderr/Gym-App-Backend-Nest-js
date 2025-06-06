import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterMemberDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  ownerId: number;
}