import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Datos para crear una sub-área interna de un laboratorio (ej. "Tiempo" y
 * "Baja Frecuencia" dentro del Laboratorio Nacional Designado de Tiempo y
 * Frecuencia) — laboratorio_id se fija en el servicio a partir del :id de
 * la ruta, nunca lo decide el cliente. No tiene relación con el organigrama
 * de RRHH (Departamento): es un catálogo propio de Laboratorios.
 */
export class CreateSubAreaLaboratorioDto {
  @ApiProperty({ example: 'Tiempo' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ required: false, example: 12 })
  @IsInt()
  @IsOptional()
  responsable_id?: number;
}
