import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class GenerateDataDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  users: number;

  @IsNumber()
  @IsPositive()
  @IsInt()
  pets: number;
}