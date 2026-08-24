import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoQueja } from '@prisma/client';

export class QuejaResponsableDto {
  @IsString()
  fase: string;

  @IsString()
  nombre: string;

  @IsString() @IsOptional()
  cargo?: string;

  @IsDateString() @IsOptional()
  fecha?: string;
}

export class CreateQuejaDto {
  @IsString() @IsOptional()
  codigo?: string;

  // --- RECEPCIÓN ---
  @IsString() @IsOptional()
  cliente?: string;

  @IsString() @IsOptional()
  telefono_contacto?: string;

  @IsString() @IsOptional()
  email_contacto?: string;

  @IsString() @IsOptional()
  formulado_por?: string;

  @IsString()
  descripcion_queja: string;

  @IsString() @IsOptional()
  recibida_por?: string;

  @IsDateString() @IsOptional()
  recibida_fecha?: string;

  // --- ANÁLISIS ---
  @IsString() @IsOptional()
  area_afectada?: string;

  @IsBoolean() @IsOptional()
  procedente?: boolean;

  @IsString() @IsOptional()
  num_iac?: string;

  @IsString() @IsOptional()
  justificativo_no_procede?: string;

  // --- ACCIONES ---
  @IsString() @IsOptional()
  acciones?: string;

  @IsDateString() @IsOptional()
  fecha_limite?: string;

  // --- CIERRE ---
  @IsString() @IsOptional()
  verificacion_eficacia?: string;

  @IsDateString() @IsOptional()
  cierre_fecha?: string;

  @IsString() @IsOptional()
  cerrada_por?: string;

  // --- ESTADO ---
  @IsEnum(EstadoQueja) @IsOptional()
  estado?: EstadoQueja;

  @IsString() @IsOptional()
  observaciones?: string;

  // --- RESPONSABLES ---
  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuejaResponsableDto)
  responsables?: QuejaResponsableDto[];
}
