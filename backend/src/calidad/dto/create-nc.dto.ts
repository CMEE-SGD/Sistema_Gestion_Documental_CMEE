import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { ClasificacionNC, EstadoNC } from '@prisma/client';

export class CreateNcDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsInt()
  @IsNotEmpty()
  auditoria_id: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

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
