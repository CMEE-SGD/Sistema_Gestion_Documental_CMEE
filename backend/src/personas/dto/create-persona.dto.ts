import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsInt,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPersona } from '@prisma/client'; // Importamos el enum de Prisma

/** Módulo controlador o servicio para gestionar la entidad CreatePersonaDto. */
export class CreatePersonaDto {
  // ❌ Eliminados: codigo, saludo, codigo_postal, telefono, fax y activo.

  @ApiPropertyOptional({ example: 'Ing.' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  grado?: string; // ✅ Nuevo (reemplaza a saludo)

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(100)
  apellidos: string;

  @ApiPropertyOptional({ example: '1712345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cedula_identidad?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @ApiPropertyOptional({ example: 'M' })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  sexo?: string;

  @ApiPropertyOptional({ example: 'Av. Amazonas N32' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  domicilio?: string;

  @ApiPropertyOptional({ example: 'Quito' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Pichincha' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string;

  @ApiPropertyOptional({ example: '0998765432' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular_1?: string; // ✅ Nuevo (reemplaza a telefono/celular antiguo)

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular_2?: string; // ✅ Nuevo (reemplaza a fax)

  @ApiPropertyOptional({ example: 'juan.perez@mail.com' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  email_1?: string;

  @ApiPropertyOptional({ example: 'juan.perez.work@mail.com' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  email_2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  foto_ruta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hoja_vida_ruta?: string;

  @ApiPropertyOptional({ default: 'Usuario del sistema' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo_recurso?: string;

  @ApiPropertyOptional({ default: 'Idioma por defecto del centro' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idioma?: string;

  @ApiPropertyOptional({ enum: EstadoPersona, default: EstadoPersona.ACTIVO })
  @IsOptional()
  @IsEnum(EstadoPersona)
  estado?: EstadoPersona; // ✅ Nuevo (reemplaza a activo booleano)

  // ✅ Campos de lógica de negocio (Se mantienen intactos)
  @ApiPropertyOptional({ description: 'Flag para eliminar foto' })
  @IsOptional()
  eliminar_foto?: string | boolean;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Arreglo de IDs de roles a asignar',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roles?: number[];

  @ApiPropertyOptional({
    description: 'Arreglo de objetos con departamento_id y puesto_id',
  })
  @IsOptional()
  @IsArray()
  puestos_asignados?: { departamento_id: number; puesto_id: number }[];
}
