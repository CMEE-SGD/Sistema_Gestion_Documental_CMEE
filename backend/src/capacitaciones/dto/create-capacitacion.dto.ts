import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';

export class CreateCapacitacionDto {
  @IsString()
  nombre: string;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsNumber()
  horas: number;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  certificado?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  persona_ids?: number[];
}
