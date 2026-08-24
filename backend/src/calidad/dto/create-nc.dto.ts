import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, IsBoolean, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ClasificacionNC } from '@prisma/client';

export class CreateNcDto {
  // El número de la NC se asigna automáticamente por el backend (secuencial global)
  @IsString()
  @IsOptional()
  codigo?: string;

  // Opcional: si se crea dentro de una auditoría, queda asociada a ella
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  auditoria_id?: number;

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

  @IsString()
  @IsOptional()
  archivo?: string;

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

  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  plan_accion?: any;

  // Verificación de eficacia de las acciones — la registra el Jefe de Calidad
  // (aprueba el cierre de la NC). Formato: { aprobado_por, aprobado_por_id,
  // fecha, resultado (EFICAZ|PARCIAL|NO_EFICAZ), observaciones }
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  verificacion_eficacia?: any;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  responsable_id?: number;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  fecha_cierre?: string;
}
