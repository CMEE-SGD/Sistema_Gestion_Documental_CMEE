import { PartialType } from '@nestjs/swagger';
import { CreateLaboratorioDto } from './create-laboratorio.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateLaboratorioDto. */
export class UpdateLaboratorioDto extends PartialType(CreateLaboratorioDto) {}
