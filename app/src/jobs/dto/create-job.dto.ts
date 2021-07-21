import {
  IsNumber,
  IsInt,
  IsNumberString,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  job_name: string;

  // @IsString()
  // jobUID: string;

  @IsNumberString()
  marker_name: number;

  @IsNumberString()
  chromosome: number;

  @IsNumberString()
  position: number;

  @IsNumberString()
  pvalue: number;

  @IsNumberString()
  effect_allele: number;

  @IsNumberString()
  alternate_allele: number;

  @IsNumberString()
  beta: number;

  @IsNumberString()
  or: number;

  @IsNumberString()
  se: number;

  @IsString()
  ncbi_build: string;

  @IsString()
  filename: string;
}
