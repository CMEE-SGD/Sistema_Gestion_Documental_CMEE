import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
    @ApiProperty({ description: 'ID de la Persona (Recurso)' })
    @IsInt()
    persona_id: number;

    @ApiProperty({ example: 'dcm' })
    @IsString()
    @MaxLength(80)
    nombre_usuario: string;

    @ApiProperty({ example: 'Admin123!', description: 'Clave en texto plano' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: [1], description: 'IDs de los grupos a asignar' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    grupoIds?: number[];

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsOptional()
    @IsDateString()
    fecha_caducidad?: string;

    @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() estado_cuenta?: boolean;
    @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() bloqueado?: boolean;
    @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() cambiar_clave_proxima_sesion?: boolean;
    
    @ApiPropertyOptional({ example: 'Español (Ecuador)' }) @IsOptional() @IsString() idioma?: string;
    @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() acceso_preferencias?: boolean;
    @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() acceso_chat?: boolean;
}