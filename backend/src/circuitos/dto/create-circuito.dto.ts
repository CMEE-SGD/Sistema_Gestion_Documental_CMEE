import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCircuitoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}