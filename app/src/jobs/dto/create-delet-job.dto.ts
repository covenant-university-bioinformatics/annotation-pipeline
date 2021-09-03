import {
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { GeneAnnot } from '../models/annotation.model';

export class CreateDeletJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  job_name: string;

  @IsNumberString()
  marker_name: string;

  @IsNumberString()
  chromosome: string;

  @IsNumberString()
  position: string;

  @IsNumberString()
  effect_allele: string;

  @IsNumberString()
  alternate_allele: string;

  @IsNotEmpty()
  @IsEnum(GeneAnnot)
  gene_db: GeneAnnot;
}
