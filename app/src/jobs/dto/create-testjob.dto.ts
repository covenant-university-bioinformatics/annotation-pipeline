import { IsNumber, IsString, Matches } from 'class-validator';

export class CreateTestjobDto {
  @IsNumber()
  numLines: number;

  @IsNumber()
  numSeconds: number;
}
