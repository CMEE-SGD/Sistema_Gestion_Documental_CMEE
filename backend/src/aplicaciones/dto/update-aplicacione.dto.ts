import { PartialType } from '@nestjs/swagger';
import { CreateAplicacioneDto } from './create-aplicacione.dto';

export class UpdateAplicacioneDto extends PartialType(CreateAplicacioneDto) {}
