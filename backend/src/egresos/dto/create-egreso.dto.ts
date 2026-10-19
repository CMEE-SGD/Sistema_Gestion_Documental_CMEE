import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Alta manual de un egreso (no proviene del Excel): cubre viáticos y otros
 * gastos que se registran a mano.
 */
export class CreateEgresoDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @MaxLength(100)
  tipo_documento: string;

  @IsString()
  @MaxLength(100)
  numero_documento: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_documento_relacionado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  autorizacion?: string;

  @IsString()
  @MaxLength(255)
  proveedor: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  identificacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referencia?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal_iva?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal_cero?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  iva?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ice?: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  saldo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retenciones?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  estado?: string;

  @IsOptional()
  @IsInt()
  dias_vencimiento?: number;

  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  forma_pago?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo_emision?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  es_viatico?: boolean;

  @IsOptional()
  @IsBoolean()
  cumple_viatico?: boolean;
}