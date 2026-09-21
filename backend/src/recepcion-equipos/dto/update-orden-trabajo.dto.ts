import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateEquipoRecepcionDto } from './update-equipo-recepcion.dto';

/**
 * Actualización de una orden de trabajo (administrador): campos de cabecera
 * (mismo conjunto que al crear) más el detalle `equipos`, que permite editar
 * los datos de los equipos existentes (los que traen `id`) o agregar nuevos.
 * No se eliminan equipos desde aquí — ver update() en el servicio.
 */
export class UpdateOrdenTrabajoDto {
  @IsString()
  @IsOptional()
  orden_trabajo_fisica?: string;

  @IsInt()
  @IsOptional()
  cliente_id?: number;

  @IsOptional()
  fecha_ingreso?: string;

  @IsString()
  @IsOptional()
  n_proforma?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsInt()
  @IsOptional()
  recibe_responsable_id?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateEquipoRecepcionDto)
  equipos?: UpdateEquipoRecepcionDto[];
}