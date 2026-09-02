import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfiguracionGeneralDto {
  @ApiPropertyOptional({
    example: 'Centro de Metrología del Ejército Ecuatoriano',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre_institucion?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(20)
  max_intentos_fallidos_login?: number;

  @ApiPropertyOptional({
    example: '192.168.1.0/24, 10.0.0.5',
    description:
      'Rangos de IP con acceso directo (CIDR o IP suelta), separados por coma o salto de línea. Las IPs fuera de estos rangos quedan en espera de aprobación.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  ip_rangos_permitidos?: string;

  @ApiPropertyOptional({
    example: 20,
    description:
      'Minutos de inactividad dentro de la plataforma antes de cerrar la sesión automáticamente. 0 desactiva el cierre por inactividad.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(180)
  tiempo_inactividad_minutos?: number;
}
