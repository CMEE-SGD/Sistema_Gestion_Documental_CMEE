import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Circuitos. */
@Controller('circuitos')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param createCircuitoDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Post()
  @RequireAccess('Recursos Humanos', 5) // Nivel 5: Creación
  create(@Body() createCircuitoDto: CreateCircuitoDto) {
    return this.circuitosService.create(createCircuitoDto);
  }

  /**
     * Obtiene información de múltiples registros.
     * @returns Array<Entidad>
     */
    @Get()
  @RequireAccess('Recursos Humanos', 2) // Nivel 2: Lectura
  findAll() {
    return this.circuitosService.findAll();
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (string)
     * @returns Entidad | PrismaResponse
     */
    @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id') id: string) {
    return this.circuitosService.findOne(+id);
  }

  /**
     * Actualiza parcialmente la información de un registro existente.
     * @param id - Datos o identificador requerido (string)
     * @param updateCircuitoDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Entidad | PrismaResponse
     */
    @Patch(':id')
  @RequireAccess('Recursos Humanos', 4) // Nivel 4: Edición
  update(@Param('id') id: string, @Body() updateCircuitoDto: UpdateCircuitoDto) {
    return this.circuitosService.update(+id, updateCircuitoDto);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @returns Entidad | PrismaResponse
     */
    @Delete(':id')
  @RequireAccess('Recursos Humanos', 5) // Nivel 5: Eliminación
  remove(@Param('id') id: string) {
    return this.circuitosService.remove(+id);
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @param data - Datos o identificador requerido (any)
     * @returns Promise<void>
     */
    @Post(':id/fases')
  @RequireAccess('Recursos Humanos', 4) // Nivel 4: Modificar fases es una edición
  saveFase(@Param('id') id: string, @Body() data: any) {
    return this.circuitosService.saveFase(+id, data);
  }

  /**
     * Obtiene información de un registro específico.
     * @param circuitoId - Datos o identificador requerido (string)
     * @returns Array<Entidad>
     */
    @Get(':circuitoId/fases')
  @RequireAccess('Recursos Humanos', 2)
  getFases(@Param('circuitoId') circuitoId: string) {
    return this.circuitosService.getFases(+circuitoId);
  }

  /**
     * Obtiene información de un registro específico.
     * @param faseId - Datos o identificador requerido (string)
     * @returns Objeto complejo / PrismaResponse
     */
    @Get(':circuitoId/fases/:faseId')
  @RequireAccess('Recursos Humanos', 2)
  getFase(@Param('faseId') faseId: string) {
    return this.circuitosService.getFase(+faseId);
  }
}