import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UnidadMedida } from '@prisma/client';

/**
 * Actualización de un producto del inventario. No incluye stock: el stock
 * solo cambia mediante movimientos (entradas, salidas y ajustes) para que
 * el kardex quede siempre completo. `stock_inicial` tampoco aplica aquí.
 */
export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidad?: UnidadMedida;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ubicacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
