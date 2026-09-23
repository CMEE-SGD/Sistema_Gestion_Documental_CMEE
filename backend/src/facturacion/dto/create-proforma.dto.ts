import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoProforma } from '@prisma/client';

export class CreateProformaDto {
  /** Número de proforma; si se omite se genera PF-<año>-NNNN. */
  @IsOptional()
  @IsString()
  numero?: string;

  @IsInt()
  cliente_id: number;

  @IsOptional()
  fecha_emision?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  monto: number;

  @IsOptional()
  @IsEnum(EstadoProforma)
  estado?: EstadoProforma;

  @IsOptional()
  @IsString()
  observaciones?: string;
}