import { IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateOwnerDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}