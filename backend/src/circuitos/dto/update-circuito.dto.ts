import { PartialType } from '@nestjs/swagger';
import { CreateCircuitoDto } from './create-circuito.dto';

export class UpdateCircuitoDto extends PartialType(CreateCircuitoDto) {}
