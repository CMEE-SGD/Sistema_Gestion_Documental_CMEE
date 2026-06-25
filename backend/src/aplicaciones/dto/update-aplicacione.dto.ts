import { PartialType } from '@nestjs/swagger';
import { CreateAplicacioneDto } from './create-aplicacione.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateAplicacioneDto. */
export class UpdateAplicacioneDto extends PartialType(CreateAplicacioneDto) {}
