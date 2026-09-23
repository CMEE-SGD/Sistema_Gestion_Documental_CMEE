import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoProforma } from '@prisma/client';

export class UpdateProformaDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  fecha_emision?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  monto?: number;

  @IsOptional()
  @IsEnum(EstadoProforma)
  estado?: EstadoProforma;

  @IsOptional()
  @IsString()
  observaciones?: string;
}