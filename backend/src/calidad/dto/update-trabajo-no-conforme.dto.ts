import { PartialType } from '@nestjs/swagger';
import { CreateTrabajoNoConformeDto } from './create-trabajo-no-conforme.dto';

export class UpdateTrabajoNoConformeDto extends PartialType(CreateTrabajoNoConformeDto) {}
