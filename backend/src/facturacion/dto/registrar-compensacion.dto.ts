import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Forma de cancelación "entrega de equipos": el cliente salda la factura
 * entregando equipos. `descuento_autorizado` es el valor acordado de lo
 * entregado; al registrar la compensación el sistema genera el pago con
 * método COMPENSACION por ese monto.
 */
export class RegistrarCompensacionDto {
  @IsOptional()
  @IsString()
  descripcion_equipo?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) => value === true || value === 'true' || value === '1',
  )
  autorizacion_previa?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  descuento_autorizado?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}