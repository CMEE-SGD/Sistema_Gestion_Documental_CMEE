import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { EstadoRecepcion } from '@prisma/client';

export class CreateRecepcionEquipoDto {
    @IsString()
    @IsNotEmpty({ message: 'El número de orden física es obligatorio' })
    orden_trabajo_fisica: string;

    @IsInt()
    @IsNotEmpty({ message: 'Debe seleccionar un cliente' })
    cliente_id: number;

    @IsString()
    @IsNotEmpty({ message: 'La descripción del equipo es obligatoria' })
    equipo_descripcion: string;

    @IsString()
    @IsOptional()
    codigo_serie?: string;

    @IsInt()
    @IsNotEmpty({ message: 'Debe asignar el equipo a un laboratorio' })
    laboratorio_id: number;

    @IsEnum(EstadoRecepcion)
    @IsOptional()
    estado?: EstadoRecepcion;
}