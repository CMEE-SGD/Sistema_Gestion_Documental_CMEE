import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AplicacionGrupoDto {
    @IsInt()
    aplicacion_id: number;

    @IsInt()
    @Min(1, { message: 'El nivel mínimo es 1' })
    @Max(5, { message: 'El nivel máximo es 5' })
    nivel: number;

    @IsOptional()
    @IsInt()
    orden?: number;
    }

    export class CreateGrupoDto {
    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AplicacionGrupoDto)
    aplicaciones?: AplicacionGrupoDto[];
}