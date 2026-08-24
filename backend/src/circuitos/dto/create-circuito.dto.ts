import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

/** Módulo controlador o servicio para gestionar la entidad CreateCircuitoDto. */
export class CreateCircuitoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
