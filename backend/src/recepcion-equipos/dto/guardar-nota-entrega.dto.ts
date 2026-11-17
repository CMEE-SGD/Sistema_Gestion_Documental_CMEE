import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CondicionCalibracion, CondicionCertificado } from '@prisma/client';

/** Un campo opcional que llega vacío ("") se trata como no enviado. */
const vacioANulo = () =>
  Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  );

/** Máximo de equipos por nota: la hoja trae 10 filas; se admiten 3 hojas. */
export const MAX_EQUIPOS_NOTA = 30;

export class NotaEntregaEquipoDto {
  @IsString()
  @IsNotEmpty({ message: 'Cada fila debe indicar el equipo' })
  @MaxLength(200)
  equipo: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(100)
  marca?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(100)
  modelo?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(100)
  serie_codigo?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(300)
  accesorios?: string;

  @vacioANulo() @IsOptional() @IsEnum(CondicionCalibracion)
  calibracion?: CondicionCalibracion;

  @vacioANulo() @IsOptional() @IsEnum(CondicionCertificado)
  certificado?: CondicionCertificado;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(150)
  informe?: string;
}

export class GuardarNotaEntregaDto {
  // El número va preimpreso en el formulario de papel: se digita a mano.
  @IsString()
  @IsNotEmpty({ message: 'Ingrese el número de la nota de entrega' })
  @MaxLength(30)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'El número solo puede llevar letras, dígitos y guiones',
  })
  numero: string;

  @IsDateString({}, { message: 'La fecha de egreso no es válida' })
  fecha_egreso: string;

  @IsString() @IsNotEmpty({ message: 'Ingrese el cliente' }) @MaxLength(200)
  cliente: string;

  @IsString() @IsNotEmpty({ message: 'Ingrese el representante' }) @MaxLength(150)
  representante: string;

  @IsString() @IsNotEmpty({ message: 'Ingrese la dirección' }) @MaxLength(250)
  direccion: string;

  @IsString() @IsNotEmpty({ message: 'Ingrese el teléfono' }) @MaxLength(40)
  telefono: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(2000)
  observaciones?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(150)
  envio_empresa?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(150)
  envio_destinatario?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(100)
  envio_ciudad?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(100)
  envio_guia?: string;

  @vacioANulo() @IsOptional() @IsDateString({}, { message: 'La fecha de envío no es válida' })
  envio_fecha?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(50)
  envio_factura_cmee?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(150)
  cliente_firma_nombre?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(20)
  cliente_firma_ci?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(150)
  cmee_firma_nombre?: string;

  @vacioANulo() @IsOptional() @IsString() @MaxLength(20)
  cmee_firma_ci?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'La nota debe listar al menos un equipo' })
  @ArrayMaxSize(MAX_EQUIPOS_NOTA, {
    message: `La nota admite hasta ${MAX_EQUIPOS_NOTA} equipos`,
  })
  @ValidateNested({ each: true })
  @Type(() => NotaEntregaEquipoDto)
  equipos: NotaEntregaEquipoDto[];
}
