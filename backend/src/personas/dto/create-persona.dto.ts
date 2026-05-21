import { IsString, IsOptional, IsDateString, IsBoolean, IsArray, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaDto {
    @ApiPropertyOptional({ example: 'PER-001' }) @IsOptional() @IsString() @MaxLength(30) codigo?: string;
    @ApiPropertyOptional({ example: 'Sr.' }) @IsOptional() @IsString() @MaxLength(10) saludo?: string;
    @ApiProperty({ example: 'Juan' }) @IsString() @MaxLength(100) nombre: string;
    @ApiProperty({ example: 'Pérez' }) @IsString() @MaxLength(100) apellidos: string;
    @ApiPropertyOptional({ example: '1712345678' }) @IsOptional() @IsString() @MaxLength(20) cedula_identidad?: string;
    @ApiPropertyOptional({ example: '1990-05-15' }) @IsOptional() @IsDateString() fecha_nacimiento?: string;
    @ApiPropertyOptional({ example: 'M' }) @IsOptional() @IsString() @MaxLength(1) sexo?: string;
    @ApiPropertyOptional({ example: 'Av. Amazonas N32' }) @IsOptional() @IsString() @MaxLength(250) domicilio?: string;
    @ApiPropertyOptional({ example: 'Quito' }) @IsOptional() @IsString() @MaxLength(100) ciudad?: string;
    @ApiPropertyOptional({ example: '170150' }) @IsOptional() @IsString() @MaxLength(15) codigo_postal?: string;
    @ApiPropertyOptional({ example: 'Pichincha' }) @IsOptional() @IsString() @MaxLength(100) provincia?: string;
    @ApiPropertyOptional({ example: '022345678' }) @IsOptional() @IsString() @MaxLength(20) telefono?: string;
    @ApiPropertyOptional({ example: '022345679' }) @IsOptional() @IsString() @MaxLength(20) fax?: string;
    @ApiPropertyOptional({ example: '0998765432' }) @IsOptional() @IsString() @MaxLength(20) celular?: string;
    @ApiPropertyOptional({ example: 'juan.perez@mail.com' }) @IsOptional() @IsString() @MaxLength(150) email_1?: string;
    @ApiPropertyOptional({ example: 'juan.perez.work@mail.com' }) @IsOptional() @IsString() @MaxLength(150) email_2?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) foto_ruta?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) hoja_vida_ruta?: string;
    @ApiPropertyOptional({ default: 'Usuario del sistema' }) @IsOptional() @IsString() @MaxLength(50) tipo_recurso?: string;
    @ApiPropertyOptional({ default: 'Idioma por defecto del centro' }) @IsOptional() @IsString() @MaxLength(50) idioma?: string;
    @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() activo?: boolean;

    // Recibe los IDs de los roles seleccionados en la UI
    @ApiPropertyOptional({ example: [1, 2], description: 'Arreglo de IDs de roles a asignar' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    roleIds?: number[];
}