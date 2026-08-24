import { PartialType } from '@nestjs/swagger';
import { CreatePuestoDto } from './create-puesto.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdatePuestoDto. */
export class UpdatePuestoDto extends PartialType(CreatePuestoDto) {}
