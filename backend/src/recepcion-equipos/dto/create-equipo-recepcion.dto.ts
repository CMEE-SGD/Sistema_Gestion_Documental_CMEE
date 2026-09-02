import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { EstadoRecepcion } from '@prisma/client';

export class CreateEquipoRecepcionDto {
  @IsString()
  @IsNotEmpty({ message: 'La descripción del equipo es obligatoria' })
  equipo_descripcion: string;

  @IsString()
  @IsOptional()
  codigo_serie?: string;

  @IsString()
  @IsOptional()
  codigo_cmee?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  accesorios?: string;

  @IsString()
  @IsOptional()
  requerimientos_calibracion?: string;

  @IsInt()
  @IsNotEmpty({ message: 'Debe asignar el equipo a un laboratorio' })
  laboratorio_id: number;

  // Sub-área interna del laboratorio, para los pocos laboratorios que
  // internamente se dividen en más de una sección (cada una con su propio
  // encargado). Opcional: la inmensa mayoría de laboratorios no la usa.
  @IsInt()
  @IsOptional()
  sub_area_id?: number;

  @IsDateString()
  @IsOptional()
  fecha_ingreso_laboratorio?: string;

  @IsEnum(EstadoRecepcion)
  @IsOptional()
  estado?: EstadoRecepcion;
}
