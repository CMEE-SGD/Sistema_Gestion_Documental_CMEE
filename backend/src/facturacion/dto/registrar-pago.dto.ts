import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '@prisma/client';

export class RegistrarPagoDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  monto: number;

  @IsOptional()
  fecha?: string;

  @IsEnum(MetodoPago)
  metodo: MetodoPago;

  /** Nº de comprobante, transferencia o cheque. */
  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  compensacion_id?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}