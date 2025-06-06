import { IsNumber, Min } from 'class-validator';

export class RenewMemberDto {
  @IsNumber()
  @Min(1)
  months: number;
}