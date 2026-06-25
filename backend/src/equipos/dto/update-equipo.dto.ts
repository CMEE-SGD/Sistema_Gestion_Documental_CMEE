import { PartialType } from '@nestjs/swagger';
import { CreateEquipoDto } from './create-equipo.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateEquipoDto. */
export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}
