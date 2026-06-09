import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateServicioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    magnitud?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsInt()
    @IsNotEmpty()
    laboratorio_id: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}