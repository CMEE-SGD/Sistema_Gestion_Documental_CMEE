import {
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
 * Alta de un producto/insumo del inventario. El stock nunca se edita desde
 * el formulario: si `stock_inicial` es > 0, el servicio crea además un
 * movimiento de ENTRADA en el kardex para que el historial quede completo
 * desde el día uno.
 */
export class CreateProductoDto {
  @IsString()
  @MaxLength(30)
  codigo: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidad?: UnidadMedida;

  @IsInt()
  @Min(1)
  categoria_id: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_inicial?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ubicacion?: string;
}
