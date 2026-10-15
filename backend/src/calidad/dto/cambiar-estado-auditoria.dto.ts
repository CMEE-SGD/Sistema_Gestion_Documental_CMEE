import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { EstadoAuditoria } from '@prisma/client';

// Transición de estado de una auditoría interna — valida la máquina de estados en
// backend y registra el historial con el usuario que la ejecuta.
//
// fecha_fin se acepta aquí porque el cierre de una auditoría exige la fecha de
// término (MC22 22.5.2) y así no obliga a abrir el formulario de edición para
// registrar el cierre.
export class CambiarEstadoAuditoriaDto {
  @IsEnum(EstadoAuditoria)
  estado: EstadoAuditoria;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;
}
