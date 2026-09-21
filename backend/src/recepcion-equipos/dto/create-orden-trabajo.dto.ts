import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEquipoRecepcionDto } from './create-equipo-recepcion.dto';

export class CreateOrdenTrabajoDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de orden física es obligatorio' })
  orden_trabajo_fisica: string;

  @IsInt()
  @IsNotEmpty({ message: 'Debe seleccionar un cliente' })
  cliente_id: number;

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

  @ValidateNested({ each: true })
  @Type(() => CreateEquipoRecepcionDto)
  @ArrayMinSize(1, { message: 'Debe incluir al menos un equipo' })
  equipos: CreateEquipoRecepcionDto[];
}
