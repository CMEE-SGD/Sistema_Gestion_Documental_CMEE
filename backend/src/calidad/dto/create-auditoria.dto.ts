import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoAuditoria, EstadoAuditoria } from '@prisma/client';

export class CreateAuditoriaDto {
  @IsString()
  @IsOptional()
  codigo?: string;

  @IsEnum(TipoAuditoria)
  @IsOptional()
  tipo?: TipoAuditoria;

  @IsString()
  @IsNotEmpty()
  alcance: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  responsable_id: number;

  @IsEnum(EstadoAuditoria)
  @IsOptional()
  estado?: EstadoAuditoria;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  objeto?: string;

  @IsOptional()
  documentos_referencia?: any;

  @IsString()
  @IsOptional()
  responsable_auditoria?: string;

  @IsOptional()
  equipo_auditor?: any;

  @IsOptional()
  cronograma?: any;

  @IsOptional()
  testificaciones?: any;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  archivo_planificacion?: string;
}
