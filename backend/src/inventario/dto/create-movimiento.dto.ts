import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MotivoMovimiento, TipoMovimientoInventario } from '@prisma/client';

/**
 * Movimiento de kardex. Significado de `cantidad` según el tipo:
 * - ENTRADA: unidades que suman al stock.
 * - SALIDA: unidades que restan (valida stock suficiente).
 * - AJUSTE: es el STOCK RESULTANTE del conteo físico; el servicio guarda en
 *   el movimiento la diferencia entre el stock anterior y ese conteo.
 */
export class CreateMovimientoDto {
  @IsInt()
  @Min(1)
  producto_id: number;

  @IsEnum(TipoMovimientoInventario)
  tipo: TipoMovimientoInventario;

  @IsEnum(MotivoMovimiento)
  motivo: MotivoMovimiento;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
