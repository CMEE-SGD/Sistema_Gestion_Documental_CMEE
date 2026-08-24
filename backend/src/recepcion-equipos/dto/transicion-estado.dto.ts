import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator';

export class TransicionEstadoDto {
  @IsString()
  @IsNotEmpty({ message: 'La acción es obligatoria' })
  @IsIn(['APROBAR', 'RECHAZAR'], { message: 'La acción debe ser APROBAR o RECHAZAR' })
  accion: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}
