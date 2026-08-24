import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { TipoCliente } from '@prisma/client';

export class CreateClienteInstitucionalDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente o institución es obligatorio' })
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ruc?: string;

  @IsString()
  @IsNotEmpty({ message: 'El representante es obligatorio' })
  @MaxLength(150)
  representante: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(250)
  direccion: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20)
  telefono: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(150)
  email?: string;

  @IsEnum(TipoCliente)
  @IsOptional()
  tipo?: TipoCliente;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
