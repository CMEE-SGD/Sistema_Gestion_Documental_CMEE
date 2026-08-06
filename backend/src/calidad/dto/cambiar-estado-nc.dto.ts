import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoNC } from '@prisma/client';

// Transición de estado de una NC — valida la máquina de estados en backend
// y registra el historial con el usuario que la ejecuta.
export class CambiarEstadoNcDto {
  @IsEnum(EstadoNC)
  estado: EstadoNC;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
