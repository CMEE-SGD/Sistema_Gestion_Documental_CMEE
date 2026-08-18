import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoRiesgo, EstadoRiesgo, TratamientoRiesgo } from '@prisma/client';

export class RiesgoResponsableDto {
  @IsString()
  fase: string;

  @IsString()
  nombre: string;

  @IsString() @IsOptional()
  cargo?: string;

  @IsDateString() @IsOptional()
  fecha?: string;
}

export class CreateRiesgoDto {
  @IsString() @IsOptional()
  codigo?: string;

  @IsEnum(TipoRiesgo) @IsOptional()
  tipo?: TipoRiesgo;

  @IsString()
  @IsNotEmpty({ message: 'El proceso es obligatorio' })
  proceso: string;

  @IsString()
  @IsNotEmpty({ message: 'El evento es obligatorio' })
  evento: string;

  @IsString() @IsOptional()
  causa?: string;

  @IsString() @IsOptional()
  fuente?: string;

  @IsString() @IsOptional()
  consecuencias?: string;

  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  probabilidad: number;

  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  impacto: number;

  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  deteccion: number;

  @IsEnum(TratamientoRiesgo) @IsOptional()
  tratamiento?: TratamientoRiesgo;

  @IsString() @IsOptional()
  acciones?: string;

  @IsDateString() @IsOptional()
  fecha_limite?: string;

  @IsString() @IsOptional()
  verificacion_eficacia?: string;

  @IsDateString() @IsOptional()
  cierre_fecha?: string;

  @IsString() @IsOptional()
  cerrada_por?: string;

  @IsEnum(EstadoRiesgo) @IsOptional()
  estado?: EstadoRiesgo;

  @IsString() @IsOptional()
  observaciones?: string;

  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RiesgoResponsableDto)
  responsables?: RiesgoResponsableDto[];
}
