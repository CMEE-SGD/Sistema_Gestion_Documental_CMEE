import { PartialType } from '@nestjs/swagger';
import { CreateServicioDto } from './create-servicio.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateServicioDto. */
export class UpdateServicioDto extends PartialType(CreateServicioDto) {}
