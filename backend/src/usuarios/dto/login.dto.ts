import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Módulo controlador o servicio para gestionar la entidad LoginDto. */
export class LoginDto {
  @ApiProperty({ example: 'jdoe' })
  @IsNotEmpty({ message: 'El usuario no puede estar vacío.' })
  @IsString({ message: 'El usuario debe ser un texto válido.' })
  nombre_usuario: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString({ message: 'La contraseña debe ser un texto válido.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  clave: string;
}
