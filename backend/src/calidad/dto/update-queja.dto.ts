import { PartialType } from '@nestjs/swagger';
import { CreateQuejaDto } from './create-queja.dto';

export class UpdateQuejaDto extends PartialType(CreateQuejaDto) {}
