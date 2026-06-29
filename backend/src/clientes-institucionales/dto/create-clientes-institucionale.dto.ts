import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { TipoCliente } from '@prisma/client';

export class CreateClienteInstitucionalDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del cliente o institución es obligatorio' })
    nombre: string;

    @IsEnum(TipoCliente)
    @IsOptional()
    tipo?: TipoCliente;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}