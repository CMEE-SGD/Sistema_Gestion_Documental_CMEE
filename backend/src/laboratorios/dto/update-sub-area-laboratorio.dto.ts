import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSubAreaLaboratorioDto } from './create-sub-area-laboratorio.dto';

export class UpdateSubAreaLaboratorioDto extends PartialType(
  CreateSubAreaLaboratorioDto,
) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
