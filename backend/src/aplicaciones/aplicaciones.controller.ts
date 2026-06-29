import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { ApiTags } from '@nestjs/swagger';

/** Módulo controlador o servicio para gestionar la entidad Aplicaciones. */
@ApiTags('Aplicaciones')
@Controller('aplicaciones')
@UseGuards(JwtAuthGuard, AccessGuard)
export class AplicacionesController {
  constructor(private readonly aplicacionesService: AplicacionesService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param body - Datos o identificador requerido ({ nombre: string; descripcion?: string; })
   * @returns Objeto complejo / PrismaResponse
   */
  @Post()
  @RequireAccess('Gestion de Usuarios', 5)
  create(@Body() body: { nombre: string; descripcion?: string }) {
    return this.aplicacionesService.create(body.nombre, body.descripcion);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  @Get()
  @RequireAccess('Gestion de Usuarios', 2) // 👇 Ajustado para permitir lectura en el formulario
  findAll() {
    return this.aplicacionesService.findAll();
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Delete(':id')
  @RequireAccess('Gestion de Usuarios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aplicacionesService.remove(id);
  }
}
