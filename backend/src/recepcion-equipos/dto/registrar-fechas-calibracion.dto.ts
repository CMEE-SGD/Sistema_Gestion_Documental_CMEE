import { IsOptional } from 'class-validator';

/**
 * Registro (Fase A) de las fechas de calibración de un equipo: cuándo se
 * calibró y cuándo vence la próxima. Base de las alertas de próxima
 * calibración (Fase D).
 */
export class RegistrarFechasCalibracionDto {
  @IsOptional()
  fecha_calibracion?: string;

  @IsOptional()
  fecha_proxima_calibracion?: string;
}