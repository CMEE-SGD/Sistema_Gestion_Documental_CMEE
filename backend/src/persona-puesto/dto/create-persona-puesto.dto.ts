import { IsInt, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Módulo controlador o servicio para gestionar la entidad CreatePersonaPuestoDto. */
export class CreatePersonaPuestoDto {
    @ApiProperty({ description: 'ID de la persona' })
    @IsInt()
    persona_id: number;

    @ApiProperty({ description: 'ID del puesto asignado' })
    @IsInt()
    puesto_id: number;

    @ApiProperty({ description: 'ID del departamento al que pertenece el puesto' })
    @IsInt()
    departamento_id: number;

    @ApiProperty({ description: 'Orden de prioridad del puesto (1 principal, 2 o 3 secundarios)', minimum: 1, maximum: 3 })
    @IsInt()
    @Min(1)
    @Max(3)
    orden_puesto: number;

    @ApiPropertyOptional({ description: 'Fecha de asignación (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    fecha_asignacion?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}