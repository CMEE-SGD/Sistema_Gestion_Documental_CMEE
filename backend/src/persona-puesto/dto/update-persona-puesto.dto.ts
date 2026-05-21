import { PartialType } from '@nestjs/swagger';
import { CreatePersonaPuestoDto } from './create-persona-puesto.dto';

export class UpdatePersonaPuestoDto extends PartialType(CreatePersonaPuestoDto) {}
