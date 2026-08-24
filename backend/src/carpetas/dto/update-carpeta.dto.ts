import { PartialType } from '@nestjs/swagger';
import { CreateCarpetaDto } from './create-carpeta.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateCarpetaDto. */
export class UpdateCarpetaDto extends PartialType(CreateCarpetaDto) {}
