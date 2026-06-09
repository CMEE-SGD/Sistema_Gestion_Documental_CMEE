import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { EstadoEquipo } from '@prisma/client';

export class CreateEquipoDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    marca?: string;

    @IsString()
    @IsOptional()
    modelo?: string;

    @IsString()
    @IsOptional()
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