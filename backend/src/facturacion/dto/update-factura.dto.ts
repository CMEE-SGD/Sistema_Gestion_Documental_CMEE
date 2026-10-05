import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoFactura } from '@prisma/client';

export class UpdateFacturaDto {
  // Estados EMITIDA/PARCIAL/PAGADA/ANULADA. El estado PARCIAL/PAGADA normalmente
  // lo recalcula el sistema al registrar pagos; aquí se permite ajuste manual.
  @IsOptional()
  @IsEnum(EstadoFactura)
  estado?: EstadoFactura;

  @IsOptional()
  @IsInt()
  plazo_dias?: number;

  // Retención de IVA editable (la extrae el XML o se digita/adjusta la cuenta).
  // Se descuenta del saldo por cobrar (total − retención_iva − pagos).
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  retencion_iva?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  porcentaje_retencion_iva?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}