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
  @IsOptional()
  alcance?: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  responsable_id?: number;

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
  nombre_oec?: string;

  @IsString()
  @IsOptional()
  expediente_nro?: string;

  @IsString()
  @IsOptional()
  tipo_oec?: string;

  @IsString()
  @IsOptional()
  email_oec?: string;

  @IsString()
  @IsOptional()
  ciudad_pais?: string;

  @IsString()
  @IsOptional()
  telefono_oec?: string;

  @IsString()
  @IsOptional()
  direccion_oficina?: string;

  @IsString()
  @IsOptional()
  localizaciones_criticas?: string;

  @IsString()
  @IsOptional()
  persona_contacto?: string;

  @IsString()
  @IsOptional()
  norma_acreditacion?: string;

  @IsString()
  @IsOptional()
  actividades_evaluacion?: string;

  @IsOptional()
  tipo_evaluacion?: any;

  @IsString()
  @IsOptional()
  fecha_evaluacion_anterior?: string;

  @IsString()
  @IsOptional()
  fecha_testificacion?: string;

  @IsString()
  @IsOptional()
  localizaciones_evaluacion?: string;

  @IsString()
  @IsOptional()
  idioma_evaluacion?: string;

  @IsDateString()
  @IsOptional()
  fecha_elaboracion?: string;

  @IsString()
  @IsOptional()
  elaborado_por?: string;

  @IsString()
  @IsOptional()
  archivo_planificacion?: string;
}
