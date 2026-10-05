import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FacturaDetalleDto {
  @IsString()
  concepto: string;

  @IsOptional()
  @IsInt()
  cantidad?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  precio_unitario?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  valor_total?: number;

  @IsOptional()
  @IsInt()
  equipo_recepcion_id?: number;
}

export class CreateFacturaDto {
  /** Número de factura; si se omite se genera FAC-<año>-NNNN. */
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  clave_acceso?: string;

  @IsInt()
  cliente_id: number;

  /**
   * Orden de trabajo que origina la factura. Se valida que TODOS sus equipos
   * estén en FINALIZADO; en caso contrario la factura no se habilita.
   */
  @IsOptional()
  @IsInt()
  orden_trabajo_id?: number;

  @IsOptional()
  fecha_emision?: string;

  /** 30 por defecto; 60/90/120 elegibles por cualquier usuario de facturación. */
  @IsOptional()
  @IsInt()
  plazo_dias?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  subtotal?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  iva?: number;

  // Retención de IVA (Ecuador): monto que el cliente retiene al pagar por ser
  // agente de retención. Se descuenta del saldo por cobrar de la factura.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  retencion_iva?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  porcentaje_retencion_iva?: number;

  /** Detalle de retenciones del XML (codigo 1 = IVA, 2 = RENTA), tal cual. */
  @IsOptional()
  @IsArray()
  retenciones?: Record<string, unknown>[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  total?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacturaDetalleDto)
  detalle?: FacturaDetalleDto[];
}