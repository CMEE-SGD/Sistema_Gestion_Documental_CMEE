import { PartialType } from '@nestjs/swagger';
import { CreateGrupoDto } from './create-grupo.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateGrupoDto. */
export class UpdateGrupoDto extends PartialType(CreateGrupoDto) {}
