import { PartialType } from '@nestjs/swagger';
import { CreatePersonaDto } from './create-persona.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdatePersonaDto. */
export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {}