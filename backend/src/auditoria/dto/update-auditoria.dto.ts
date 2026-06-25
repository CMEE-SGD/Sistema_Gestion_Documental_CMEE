import { PartialType } from '@nestjs/swagger';
import { CreateAuditoriaDto } from './create-auditoria.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateAuditoriaDto. */
export class UpdateAuditoriaDto extends PartialType(CreateAuditoriaDto) {}
