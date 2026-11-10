import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrigenAccion, TipoAccion } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { AccionesService } from './acciones.service';
import { CreateAccionDto, UpdateAccionDto } from './dto/create-accion.dto';

@Controller('calidad/acciones')
@UseGuards(JwtAuthGuard, AccessGuard)
export class AccionesController {
  constructor(private readonly acciones: AccionesService) {}

  @Post()
  @RequireAccess('Gestion de Calidad', 5)
  create(@Body() dto: CreateAccionDto) {
    return this.acciones.create(dto);
  }

  @Get()
  @RequireAccess('Gestion de Calidad', 2)
  findAll(
    @Query('tipo') tipo?: TipoAccion,
    @Query('origen_tipo') origen_tipo?: OrigenAccion,
    @Query('origen_id') origen_id?: string,
    @Query('estado') estado?: string,
  ) {
    return this.acciones.findAll({
      tipo,
      origen_tipo,
      origen_id: origen_id ? parseInt(origen_id, 10) : undefined,
      estado,
    });
  }

  @Get(':id')
  @RequireAccess('Gestion de Calidad', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.acciones.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Gestion de Calidad', 4)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccionDto) {
    return this.acciones.update(id, dto);
  }

  @Delete(':id')
  @RequireAccess('Gestion de Calidad', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.acciones.remove(id);
  }
}
