import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ClasificacionNC, EstadoNC } from '@prisma/client';

export class CreateNcDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsInt()
  @IsNotEmpty()
  auditoria_id: number;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  requisito?: string;

  @IsString()
  @IsNotEmpty()
  hallazgo: string;

  @IsString()
  @IsOptional()
  evidencia?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  aceptada_oec?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  reiterada?: boolean;

  // Legacy campos — se mantienen para futuro módulo de acciones correctivas
  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  requisito_incumplido?: string;

  @IsEnum(ClasificacionNC)
  @IsOptional()
  clasificacion?: ClasificacionNC;

  @IsString()
  @IsOptional()
  causa_raiz?: string;

  @IsString()
  @IsOptional()
  acciones_inmediatas?: string;

  @IsEnum(EstadoNC)
  @IsOptional()
  estado?: EstadoNC;

  @IsInt()
  @IsOptional()
  responsable_id?: number;

  @IsDateString()
  @IsOptional()
  fecha_cierre?: string;
}
