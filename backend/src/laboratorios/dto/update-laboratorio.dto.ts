import { PartialType } from '@nestjs/swagger';
import { CreateLaboratorioDto } from './create-laboratorio.dto';

export class UpdateLaboratorioDto extends PartialType(CreateLaboratorioDto) {}
