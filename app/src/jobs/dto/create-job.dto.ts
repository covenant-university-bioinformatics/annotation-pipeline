import {
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
  IsBooleanString,
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
  all_1000g: string;

  @IsBooleanString()
  afr_1000g: string;

  @IsBooleanString()
  amr_1000g: string;

  @IsBooleanString()
  eas_1000g: string;

  @IsBooleanString()
  eur_1000g: string;

  @IsBooleanString()
  sas_1000g: string;

  @IsBooleanString()
  exac: string;

  @IsBooleanString()
  dbnsfp: string;

  @IsBooleanString()
  clinvar: string;

  @IsBooleanString()
  intervar: string;
}
