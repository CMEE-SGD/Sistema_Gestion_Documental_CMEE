import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNivelCarpeta } from '@prisma/client';

export class CarpetaPermisoDto {
  @IsOptional() @IsInt()
  departamento_id?: number;

  @IsOptional() @IsInt()
  persona_id?: number;

  @IsOptional() @IsInt()
  nivel_permiso?: number;

  @IsOptional() @IsBoolean()
  permiso_docs?: boolean;

  @IsOptional() @IsBoolean()
  permiso_carpetas?: boolean;

  @IsOptional() @IsBoolean()
  permiso_extra?: boolean;
}

/** Módulo controlador o servicio para gestionar la entidad CreateCarpetaDto. */
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarpetaPermisoDto)
  permisos?: CarpetaPermisoDto[];
}
