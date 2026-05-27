import { IsString, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { TipoNivelCarpeta } from '@prisma/client';

export class CreateCarpetaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  version_inicial?: string;

  @IsOptional()
  @IsString()
  etiquetas?: string;

  @IsOptional()
  @IsEnum(TipoNivelCarpeta)
  tipo?: TipoNivelCarpeta;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  carpeta_padre_id?: number;
}