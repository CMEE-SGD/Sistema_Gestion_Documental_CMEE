import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { TransicionEstadoDto } from './transicion-estado.dto';

/**
 * Entrega (o rechazo) de la orden completa. Al entregar se indica cómo paga el
 * cliente:
 *  - CONTADO: paga al retirar → comprobante y monto pagado obligatorios.
 *  - CREDITO: paga después → solo el monto sin IVA; el comprobante se sube luego.
 * Los clientes militares no pagan: la orden queda SIN_COSTO automáticamente.
 */
export class EntregarOrdenDto extends TransicionEstadoDto {
  @IsOptional()
  @IsIn(['CONTADO', 'CREDITO'], { message: 'La condición de pago debe ser CONTADO o CREDITO' })
  condicion_pago?: 'CONTADO' | 'CREDITO';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto sin IVA debe ser un número con hasta 2 decimales' })
  @Min(0.01, { message: 'El monto sin IVA debe ser mayor a 0' })
  monto_sin_iva?: number;
}
