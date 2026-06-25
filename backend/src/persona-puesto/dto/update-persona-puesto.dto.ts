import { PartialType } from '@nestjs/swagger';
import { CreatePersonaPuestoDto } from './create-persona-puesto.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdatePersonaPuestoDto. */
export class UpdatePersonaPuestoDto extends PartialType(CreatePersonaPuestoDto) {}
