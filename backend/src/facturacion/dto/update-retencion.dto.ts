import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

/**
 * Guardado de la retención del comprobante de una factura. Es la captura de un
 * dato del documento que emite el cliente (agente de retención), no una edición
 * de negocio, así que su endpoint va exento de motivo (`@SinMotivo()`).
 *
 * Llega como multipart (por el XML adjunto): los numéricos vienen como texto,
 * por eso se convierten con `@Type`, y `retenciones` viaja como string JSON.
 */
export class UpdateRetencionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  retencion_iva?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  porcentaje_retencion_iva?: number;

  /** Detalle de retenciones del comprobante (codigo 2 = IVA, 1 = RENTA). */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @IsArray()
  retenciones?: Record<string, unknown>[];
}
