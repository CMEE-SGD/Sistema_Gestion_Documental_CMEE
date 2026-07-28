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
}
