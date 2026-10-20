import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Resolución (por el Director) de una solicitud de autorización de
 * compensación: APROBADA habilita el formulario de compensación en el
 * detalle de la factura; RECHAZADA lo mantiene bloqueado.
 */
export class ResolverAutorizacionCompensacionDto {
  @IsIn(['APROBADA', 'RECHAZADA'])
  estado: 'APROBADA' | 'RECHAZADA';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}