import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsDateString, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoAccion, OrigenAccion, EstadoAccion } from '@prisma/client';

export class CreateAccionDto {
  @IsEnum(TipoAccion)
  tipo: TipoAccion;

  @IsEnum(OrigenAccion)
  origen_tipo: OrigenAccion;

  @Type(() => Number) @IsInt()
  origen_id: number;

  @IsString()
  @IsNotEmpty({ message: 'La descripción de la acción es obligatoria' })
  descripcion: string;

  @IsString() @IsOptional()
  causa?: string;

  @IsString() @IsOptional()
  responsable?: string;

  @IsDateString() @IsOptional()
  fecha_limite?: string;
}

// El origen no se puede cambiar una vez creada la acción.
export class UpdateAccionDto {
  @IsEnum(TipoAccion) @IsOptional()
  tipo?: TipoAccion;

  @IsString() @IsNotEmpty() @IsOptional()
  descripcion?: string;

  @IsString() @IsOptional()
  causa?: string;

  @IsString() @IsOptional()
  responsable?: string;

  @IsDateString() @IsOptional()
  fecha_limite?: string;

  @IsEnum(EstadoAccion) @IsOptional()
  estado?: EstadoAccion;

  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean() @IsOptional()
  eficaz?: boolean | null;

  @IsString() @IsOptional()
  verificacion_eficacia?: string;

  @IsDateString() @IsOptional()
  fecha_cierre?: string;
}
