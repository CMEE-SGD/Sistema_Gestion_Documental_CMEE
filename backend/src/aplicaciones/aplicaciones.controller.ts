import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';

@Controller('aplicaciones')
export class AplicacionesController {
  constructor(private readonly aplicacionesService: AplicacionesService) {}

  @Post()
  create(@Body() body: { nombre: string; descripcion?: string }) {
    return this.aplicacionesService.create(body.nombre, body.descripcion);
  }

  @Get()
  findAll() {
    return this.aplicacionesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aplicacionesService.remove(id);
  }
}