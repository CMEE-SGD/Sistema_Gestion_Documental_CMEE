import { PartialType } from '@nestjs/swagger';
import { CreateDepartamentoDto } from './create-departamento.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateDepartamentoDto. */
export class UpdateDepartamentoDto extends PartialType(CreateDepartamentoDto) {}
