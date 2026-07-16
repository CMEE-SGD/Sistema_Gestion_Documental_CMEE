import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoAuditoria, EstadoAuditoria } from '@prisma/client';

export class CreateAuditoriaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

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
  observaciones?: string;

  @IsString()
  @IsOptional()
  archivo_planificacion?: string;
}
