import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoRecepcion } from '@prisma/client';

/**
 * Cambio manual de fase reservado a administradores (nivel 5): permite
 * corregir el flujo cuando un usuario avanzó o rechazó por equivocación.
 * A diferencia de TransicionEstadoDto (que solo acepta APROBAR/RECHAZAR y
 * deja que la máquina de estados decida el destino), aquí el admin define
 * el estado destino directamente.
 */
export class CambiarFaseAdminDto {
  @IsEnum(EstadoRecepcion, {
    message: 'El estado no es válido',
  })
  estado: EstadoRecepcion;

  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Las observaciones no pueden exceder 500 caracteres',
  })
  observaciones?: string;
}