import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePuestoDto {
    @ApiProperty({ example: 'DCM' })
    @IsString()
    @MaxLength(20)
    codigo: string;

    @ApiProperty({ example: 'Director del CMEE' })
    @IsString()
    @MaxLength(200)
    nombre: string;

    // Agrupamos los campos de texto opcionales
    @ApiPropertyOptional() @IsOptional() @IsString() educacion?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() formacion?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() habilidad?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() experiencia?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() conocimiento_tecnico?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() calificacion?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() autoridad?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() responsabilidades?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() funcion_principal?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() funciones_alternas?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() funciones?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() perfil_educacion_indispensable?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() perfil_formacion_deseable?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() perfil_capacidades_deseable?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() perfil_experiencia_deseable?: string;

    @ApiPropertyOptional({ description: 'ID del puesto padre jerárquico' })
    @IsOptional()
    @IsInt()
    dependencia_id?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    orden?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}