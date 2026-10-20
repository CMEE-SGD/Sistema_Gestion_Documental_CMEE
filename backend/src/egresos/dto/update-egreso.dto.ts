import { IsBoolean, IsOptional } from 'class-validator';

/** Actualización de un egreso: por ahora el control de viáticos (¿Cumple?). */
export class UpdateEgresoDto {
  @IsOptional()
  @IsBoolean()
  es_viatico?: boolean;

  @IsOptional()
  @IsBoolean()
  cumple_viatico?: boolean;
}