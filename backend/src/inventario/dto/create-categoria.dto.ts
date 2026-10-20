import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/** Categoría de insumo (reactivos, gases, patrones, consumibles…). */
export class CreateCategoriaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;
}

/** Renombrar y/o desactivar una categoría de insumos. */
export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
