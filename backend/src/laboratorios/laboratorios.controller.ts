import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LaboratoriosService } from './laboratorios.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Laboratorios. */
@Controller('laboratorios')
@UseGuards(JwtAuthGuard, AccessGuard)
export class LaboratoriosController {
  constructor(private readonly laboratoriosService: LaboratoriosService) {}

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param createLaboratorioDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Post()
  @RequireAccess('Laboratorios', 5)
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratoriosService.create(createLaboratorioDto);
  }

  /**
     * Obtiene información de múltiples registros.
     * @returns Array<Entidad>
     */
    @Get()
  @RequireAccess('Laboratorios', 2)
  findAll() {
    return this.laboratoriosService.findAll();
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (number)
     * @returns Array<Entidad>
     */
    @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.findOne(id);
  }

  /**
     * Actualiza parcialmente la información de un registro existente.
     * @param id - Datos o identificador requerido (number)
     * @param updateLaboratorioDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Patch(':id')
  @RequireAccess('Laboratorios', 4)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLaboratorioDto: UpdateLaboratorioDto) {
    return this.laboratoriosService.update(id, updateLaboratorioDto);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Delete(':id')
  @RequireAccess('Laboratorios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.remove(id);
  }
}