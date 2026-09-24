import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Cuerpo del multipart al importar el XML de la factura electrónica que emite
 * la encargada del sistema financiero: `cliente_id`/`plazo_dias` van como
 * campos de texto del formulario y el archivo XML como `file`.
 *
 * La ValidationPipe global usa `transform: true` sin conversión implícita de
 * primitivos, así que los campos numéricos del multipart se convierten aquí
 * con `@Type(() => Number)` antes de validarse.
 */
export class ImportarXmlFacturaDto {
  @Type(() => Number)
  @IsInt()
  cliente_id: number;

  /**
   * Orden de trabajo que origina la factura. Se valida que TODOS sus equipos
   * estén en FINALIZADO; en caso contrario la factura no se habilita.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orden_trabajo_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plazo_dias?: number;
}