import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Configuración de la distribución de resultados entre dos empresas (15/85 por
 * defecto). Base: `neto` (facturas − egresos), `cobrado` (pagos), `facturado`
 * (total facturas) o `todos` (cada indicador en USD). Fila única (id 1).
 */
export class UpdateDistribucionDto {
  @IsOptional()
  @IsBoolean()
  habilitada?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  empresa_a_nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  empresa_a_porcentaje?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  empresa_b_nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  empresa_b_porcentaje?: number;

  @IsOptional()
  @IsIn(['neto', 'cobrado', 'facturado', 'todos'])
  base?: 'neto' | 'cobrado' | 'facturado' | 'todos';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}