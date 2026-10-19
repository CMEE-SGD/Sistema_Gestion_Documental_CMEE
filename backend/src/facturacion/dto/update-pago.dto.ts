import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '@prisma/client';

/**
 * Edición de un pago ya registrado. A diferencia de RegistrarPagoDto no incluye
 * `compensacion_id`: el vínculo con una compensación no se cambia desde aquí
 * (los pagos generados por una compensación se gestionan desde ese flujo).
 */
export class UpdatePagoDto {
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
  @IsString()
  observaciones?: string;
}
