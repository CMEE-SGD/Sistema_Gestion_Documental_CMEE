import { PartialType } from '@nestjs/swagger';
import { CreateRolDto } from './create-rol.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateRolDto. */
export class UpdateRolDto extends PartialType(CreateRolDto) {}