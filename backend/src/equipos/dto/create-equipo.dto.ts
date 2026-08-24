import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { EstadoEquipo } from '@prisma/client';

/** Módulo controlador o servicio para gestionar la entidad CreateEquipoDto. */
export class CreateEquipoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  marca?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  modelo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  numero_serie?: string;

  @IsEnum(EstadoEquipo)
  @IsOptional()
  estado?: EstadoEquipo;

  @IsInt()
  @IsNotEmpty()
  laboratorio_id: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
