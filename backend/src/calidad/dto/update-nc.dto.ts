import { PartialType } from '@nestjs/swagger';
import { CreateNcDto } from './create-nc.dto';

export class UpdateNcDto extends PartialType(CreateNcDto) {}
