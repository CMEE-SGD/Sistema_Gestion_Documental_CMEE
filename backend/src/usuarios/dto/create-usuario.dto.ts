import { IsString, IsNotEmpty, IsInt, MinLength, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
    @ApiProperty({ example: 1 }) 
    @IsNotEmpty() 
    @IsInt() 
    persona_id: number;

    @ApiProperty({ example: 'jdoe' }) 
    @IsNotEmpty() 
    @IsString() 
    nombre_usuario: string;

    @ApiProperty({ example: 'password123' }) 
    @IsNotEmpty() 
    @IsString() 
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    clave: string; // Se recibe del frontend y se transforma en password_hash en el servicio

    @ApiPropertyOptional({ example: '2026-12-31' }) 
    @IsOptional() 
    @IsDateString() 
    fecha_caducidad?: string | null;

    @ApiPropertyOptional({ default: true }) 
    @IsOptional() 
    @IsBoolean() 
    estado_cuenta?: boolean;

    @ApiPropertyOptional({ default: false }) 
    @IsOptional() 
    @IsBoolean() 
    bloqueado?: boolean;

    @ApiPropertyOptional({ default: false }) 
    @IsOptional() 
    @IsBoolean() 
    cambiar_clave_proxima_sesion?: boolean;

    @ApiPropertyOptional({ example: 'Español' }) 
    @IsOptional() 
    @IsString() 
    idioma?: string;

    @ApiPropertyOptional({ default: false }) 
    @IsOptional() 
    @IsBoolean() 
    acceso_preferencias?: boolean;

    @ApiPropertyOptional({ default: false }) 
    @IsOptional() 
    @IsBoolean() 
    acceso_chat?: boolean;

    @ApiPropertyOptional({ example: [1, 2], description: 'Arreglo de IDs de grupos asignados' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    grupoIds?: number[];
}