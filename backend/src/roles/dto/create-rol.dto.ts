import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Módulo controlador o servicio para gestionar la entidad CreateRolDto. */
export class CreateRolDto {
  @ApiProperty({ example: 'R5S' })
  @IsString()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Responsable de 5S' })
  @IsString()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funciones?: string;

  // Recomendado: Agrupa los campos largos para mantener el código limpio.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  educacion_indispensable?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() educacion_deseable?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formacion_indispensable?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() formacion_deseable?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capacidades_indispensable?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capacidades_deseable?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experiencia_indispensable?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experiencia_deseable?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
