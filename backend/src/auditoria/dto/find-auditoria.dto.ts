import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

const MODULOS_VALIDOS = [
  'RECEPCION-EQUIPOS',
  'CERTIFICADOS',
  'CLIENTES-INSTITUCIONALES',
  'PERSONAS',
  'USUARIOS',
  'ROLES',
  'PUESTOS',
  'GRUPOS',
  'LABORATORIOS',
  'EQUIPOS',
  'SERVICIOS',
  'DOCUMENTOS',
  'CARPETAS',
  'CIRCUITOS',
  'DEPARTAMENTOS',
  'APLICACIONES',
  'REPORTES',
  'AUDITORIA',
  'NOTIFICACIONES',
  'PERSONA-PUESTO',
  'CONFIGURACION-GENERAL',
  'SISTEMA',
] as const;

/** Filtros de búsqueda para GET /auditoria — todos opcionales. */
export class FindAuditoriaDto {
  @IsOptional()
  @IsIn(MODULOS_VALIDOS)
  modulo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entidadId?: number;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsString()
  usuario?: string;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  porPagina?: number;
}
