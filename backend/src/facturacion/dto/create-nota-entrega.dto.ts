import { IsOptional, IsString } from 'class-validator';

export class CreateNotaEntregaDto {
  @IsOptional()
  @IsString()
  recibido_por?: string;

  @IsOptional()
  fecha_entrega?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}