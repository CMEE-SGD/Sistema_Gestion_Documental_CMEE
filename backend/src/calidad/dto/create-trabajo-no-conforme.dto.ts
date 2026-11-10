import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsDateString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoriaTrabajoNC } from '@prisma/client';

// Los checkbox del frontend pueden llegar como string ('true'/'false');
// sin esta conversión IsBoolean rechazaría un formulario válido.
const aBooleano = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class CreateTrabajoNoConformeDto {
  @IsString() @IsOptional()
  codigo?: string;

  // --- 1. DESCRIPCIÓN ---
  @IsString()
  @IsNotEmpty({ message: 'El campo "Elaborado / Detectado por" es obligatorio' })
  elaborado_por: string;

  // Opcional: si no llega, el servicio registra la fecha actual.
  @IsDateString() @IsOptional()
  fecha?: string;

  @IsEnum(CategoriaTrabajoNC) @IsOptional()
  categoria?: CategoriaTrabajoNC;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del problema es obligatoria' })
  descripcion_problema: string;

  // --- 2. TRATAMIENTO ---
  @IsString() @IsOptional()
  tratamiento_responsable?: string;

  @IsDateString() @IsOptional()
  tratamiento_fecha?: string;

  @IsArray() @IsOptional()
  @IsString({ each: true })
  acciones_tomadas?: string[];

  @IsString() @IsOptional()
  tratamiento_descripcion?: string;

  // --- 3. ACCIÓN CORRECTIVA / PREVENTIVA ---
  @Transform(aBooleano)
  @IsBoolean() @IsOptional()
  requiere_accion_correctiva?: boolean;

  @IsString() @IsOptional()
  accion_correctiva_num?: string;

  @Transform(aBooleano)
  @IsBoolean() @IsOptional()
  requiere_accion_preventiva?: boolean;

  @IsString() @IsOptional()
  accion_preventiva_num?: string;

  // --- 4. SEGUIMIENTO ---
  @IsString() @IsOptional()
  seguimiento_responsable?: string;

  @IsDateString() @IsOptional()
  seguimiento_fecha?: string;

  @Transform(aBooleano)
  @IsBoolean() @IsOptional()
  eficaz?: boolean | null;

  @IsString() @IsOptional()
  eficacia_verificada?: string;

  // --- 5. OBSERVACIONES Y CIERRE ---
  @IsString() @IsOptional()
  observaciones?: string;

  @IsString() @IsOptional()
  cerrado_por?: string;

  @IsDateString() @IsOptional()
  fecha_cierre?: string;

  // `estado` no se acepta del cliente: lo deriva el servicio a partir de las
  // secciones completadas, para que la lista y el detalle nunca muestren un
  // estado desincronizado del formulario.
}
