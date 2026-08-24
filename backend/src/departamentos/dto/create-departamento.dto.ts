import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Módulo controlador o servicio para gestionar la entidad CreateDepartamentoDto. */
export class CreateDepartamentoDto {
  @ApiProperty({ example: 'DEP-IT' })
  @IsString()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Tecnologías de la Información' })
  @IsString()
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ default: 'Departamento' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'ID del departamento padre' })
  @IsOptional()
  @IsInt()
  dependencia_id?: number;

  @ApiPropertyOptional({ description: 'ID de la persona responsable' })
  @IsOptional()
  @IsInt()
  responsable_id?: number;

  // PATCH: Nueva propiedad para vincular el departamento a un laboratorio
  @ApiPropertyOptional({ description: 'ID del laboratorio al que pertenece el departamento' })
  @IsOptional()
  @IsInt()
  laboratorio_id?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
