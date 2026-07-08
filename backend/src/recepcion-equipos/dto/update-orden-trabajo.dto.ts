import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrdenTrabajoDto } from './create-orden-trabajo.dto';

export class UpdateOrdenTrabajoDto extends PartialType(
  OmitType(CreateOrdenTrabajoDto, ['equipos'] as const),
) {}
