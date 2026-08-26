import { IsString, IsNumber, IsOptional, IsArray, IsDateString } from 'class-validator';

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
  proveedor?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsArray()
  persona_ids?: number[];
}
