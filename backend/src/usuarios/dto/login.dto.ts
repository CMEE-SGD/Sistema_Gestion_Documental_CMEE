import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'jdoe' })
    @IsNotEmpty()
    @IsString()
    nombre_usuario: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    clave: string;
}
