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
 * los datos de los equipos existentes (los que traen `id`), agregar nuevos y
 * eliminar los indicados en `equipos_eliminar`. Un equipo que simplemente no
 * viene en `equipos` NO se elimina (la lista del formulario puede estar
 * filtrada por rol/laboratorio). Ver update() en el servicio.
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

  @IsInt()
  @IsOptional()
  proforma_id?: number;

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

  // Ids de los equipos que el usuario quitó de la orden en el formulario.
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  equipos_eliminar?: number[];
}