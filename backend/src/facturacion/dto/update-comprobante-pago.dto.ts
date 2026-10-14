import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Edición del comprobante de pago de una factura: el que subió Servicio al
 * Cliente al entregar la orden y que cuenta como cobro (ver `enriquecer` y
 * `obtenerSaldo`). Permite corregir el monto y, opcionalmente, reemplazar el
 * archivo adjunto (viene en el campo multipart `comprobante`).
 */
export class UpdateComprobantePagoDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto: number;
}
