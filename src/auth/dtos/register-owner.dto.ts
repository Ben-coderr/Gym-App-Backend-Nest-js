import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterOwnerDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  phone: string;
}