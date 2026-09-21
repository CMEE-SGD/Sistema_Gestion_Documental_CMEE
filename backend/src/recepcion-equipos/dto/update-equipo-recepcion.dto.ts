import { PartialType, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateEquipoRecepcionDto } from './create-equipo-recepcion.dto';

/**
 * Equipo dentro de la edición de una orden de trabajo: mismo conjunto de
 * campos que al crear, más un `id` opcional que indica si se actualiza un
 * equipo ya existente o si se crea uno nuevo en la orden.
 *
 * El campo `estado` se excluye a propósito: la fase del equipo no se edita
 * desde aquí — se mueve con el flujo de estados normal o con el ajuste
 * manual del administrador (cambiar-fase).
 */
export class UpdateEquipoRecepcionDto extends PartialType(
  OmitType(CreateEquipoRecepcionDto, ['estado'] as const),
) {
  @IsInt()
  @IsOptional()
  id?: number;
}