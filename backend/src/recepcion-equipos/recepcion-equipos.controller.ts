import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RecepcionEquiposService } from './recepcion-equipos.service';
import { CreateRecepcionEquipoDto } from './dto/create-recepcion-equipo.dto';
import { UpdateRecepcionEquipoDto } from './dto/update-recepcion-equipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recepcion-equipos')
export class RecepcionEquiposController {
  constructor(private readonly recepcionService: RecepcionEquiposService) {}

  @Post()
  create(@Body() createDto: CreateRecepcionEquipoDto) {
    return this.recepcionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.recepcionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recepcionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateRecepcionEquipoDto) {
    return this.recepcionService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recepcionService.remove(+id);
  }
}