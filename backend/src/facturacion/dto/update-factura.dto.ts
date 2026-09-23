import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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

  @IsOptional()
  @IsString()
  notas?: string;
}