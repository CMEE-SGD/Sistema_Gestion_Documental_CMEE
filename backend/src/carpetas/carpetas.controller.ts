import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CarpetasService } from './carpetas.service';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Carpetas. */
@Controller('carpetas')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad global del controlador
export class CarpetasController {
  constructor(private readonly carpetasService: CarpetasService) {}

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param data - Datos o identificador requerido (any)
     * @returns Entidad | PrismaResponse
     */
    @Post()
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Crear carpetas
  async create(@Body() data: any) {
    return this.carpetasService.create(data);
  }

  /**
     * Obtiene información de múltiples registros.
     * @returns Array<Entidad>
     */
    @Get()
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Leer listado
  findAll() {
    return this.carpetasService.findAll();
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (string)
     * @returns Entidad | PrismaResponse
     */
    @Get(':id')
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Leer detalle
  findOne(@Param('id') id: string) {
    return this.carpetasService.findOne(+id);
  }

  /**
     * Actualiza parcialmente la información de un registro existente.
     * @param id - Datos o identificador requerido (string)
     * @param data - Datos o identificador requerido (any)
     * @returns Entidad | PrismaResponse
     */
    @Patch(':id')
  @RequireAccess('Gestor Documental', 4) // Nivel 4: Editar carpeta
  async update(@Param('id') id: string, @Body() data: any) {
    return this.carpetasService.update(+id, data);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @returns Entidad | PrismaResponse
     */
    @Delete(':id')
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Eliminar carpeta
  async remove(@Param('id') id: string) {
    return this.carpetasService.remove(+id);
  }
}