import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Datos mínimos para crear un Departamento ya vinculado a un laboratorio
 * (laboratorio_id se fija en el servicio a partir del :id de la ruta, nunca
 * lo decide el cliente) — usado por el atajo "Vincular departamento" del
 * formulario de Laboratorio, para que crear un laboratorio no deje personas
 * sin poder quedar asociadas a él por falta de un Departamento enlazado.
 */
export class CrearDepartamentoVinculadoDto {
  @ApiProperty({ example: 'DEP-LTE' })
  @IsString()
  @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Departamento de Termometría' })
  @IsString()
  @MaxLength(200)
  nombre: string;
}
