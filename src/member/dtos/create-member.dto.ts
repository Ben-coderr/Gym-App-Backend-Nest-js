import { IsString, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsPhoneNumber('DZ') // Assuming Algeria as the country code
  phone: string;
}