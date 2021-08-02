import {
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
  IsBooleanString,
  IsBoolean,
} from 'class-validator';

export class CreateJobDto {
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

  @IsBooleanString()
  cytoband: string;

  @IsBooleanString()
  kgp_all: string;

  @IsBooleanString()
  kgp_afr: string;

  @IsBooleanString()
  kgp_amr: string;

  @IsBooleanString()
  kgp_eas: string;

  @IsBooleanString()
  kgp_eur: string;

  @IsBooleanString()
  kgp_sas: string;

  @IsBooleanString()
  exac: string;

  @IsBooleanString()
  disgenet: string;

  @IsBooleanString()
  clinvar: string;

  @IsBooleanString()
  intervar: string;
}
