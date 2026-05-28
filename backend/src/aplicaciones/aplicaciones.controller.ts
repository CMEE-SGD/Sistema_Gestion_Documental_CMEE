import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Aplicaciones')
@Controller('aplicaciones')
@UseGuards(JwtAuthGuard, AccessGuard)
export class AplicacionesController {
  constructor(private readonly aplicacionesService: AplicacionesService) {}

  @Post()
  @RequireAccess('Gestion de Usuarios', 5)
  create(@Body() body: { nombre: string; descripcion?: string }) {
    return this.aplicacionesService.create(body.nombre, body.descripcion);
  }

  @Get()
  @RequireAccess('Gestion de Usuarios', 5)
  findAll() {
    return this.aplicacionesService.findAll();
  }

  @Delete(':id')
  @RequireAccess('Gestion de Usuarios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aplicacionesService.remove(id);
  }
}