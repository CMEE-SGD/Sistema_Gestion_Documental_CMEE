import { PartialType } from '@nestjs/swagger';
import { CreateRecepcionEquipoDto } from './create-recepcion-equipo.dto';

export class UpdateRecepcionEquipoDto extends PartialType(
  CreateRecepcionEquipoDto,
) {}
