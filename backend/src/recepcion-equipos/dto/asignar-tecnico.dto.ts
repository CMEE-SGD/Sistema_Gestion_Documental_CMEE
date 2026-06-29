import { IsInt, IsNotEmpty } from 'class-validator';

export class AsignarTecnicoDto {
  @IsInt()
  @IsNotEmpty({ message: 'Debe seleccionar un técnico' })
  tecnico_id: number;
}
