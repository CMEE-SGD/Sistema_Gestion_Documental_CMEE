import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Datos que un usuario puede actualizar de su propio perfil (self-service). */
export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'Español (Ecuador)' })
  @IsOptional()
  @IsString()
  idioma?: string;

  @ApiPropertyOptional({ description: 'Requerida si se envía clave_nueva' })
  @IsOptional()
  @IsString()
  clave_actual?: string;

  @ApiPropertyOptional({ example: 'nuevaPassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  clave_nueva?: string;
}
