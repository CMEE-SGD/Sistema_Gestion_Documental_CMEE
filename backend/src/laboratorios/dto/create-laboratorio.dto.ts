import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';

/** Módulo controlador o servicio para gestionar la entidad CreateLaboratorioDto. */
export class CreateLaboratorioDto {
    @IsString()
    @IsOptional()
    codigo?: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsInt()
    @IsOptional()
    responsable_id?: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}