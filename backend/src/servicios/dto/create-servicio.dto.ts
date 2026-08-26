import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';

/** Módulo controlador o servicio para gestionar la entidad CreateServicioDto. */
export class CreateServicioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  magnitud: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @IsNotEmpty()
  laboratorio_id: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
