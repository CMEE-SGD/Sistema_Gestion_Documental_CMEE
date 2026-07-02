import { IsInt, IsNotEmpty } from 'class-validator';

export class UploadCertificadoDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la recepción de equipo es obligatorio' })
  recepcion_equipo_id: number;
}
