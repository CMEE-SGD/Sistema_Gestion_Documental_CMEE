import { PartialType } from '@nestjs/swagger';
import { CreateCircuitoDto } from './create-circuito.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateCircuitoDto. */
export class UpdateCircuitoDto extends PartialType(CreateCircuitoDto) {}
