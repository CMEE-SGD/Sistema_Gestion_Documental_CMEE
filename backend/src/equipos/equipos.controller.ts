import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('equipos')
@UseGuards(JwtAuthGuard, AccessGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  @RequireAccess('Laboratorios', 5)
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  @Get()
  @RequireAccess('Laboratorios', 2)
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Laboratorios', 4)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equiposService.update(id, updateEquipoDto);
  }

  @Delete(':id')
  @RequireAccess('Laboratorios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.remove(id);
  }
}