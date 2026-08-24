import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateUsuarioDto. */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
