import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Puestos')
@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo puesto' })
  create(@Body() createPuestoDto: CreatePuestoDto) {
    return this.puestosService.create(createPuestoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar puestos activos (incluye padre)' })
  findAll() {
    return this.puestosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un puesto por ID (incluye padre e hijos)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.puestosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un puesto parcialmente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePuestoDto: UpdatePuestoDto) {
    return this.puestosService.update(id, updatePuestoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un puesto (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.puestosService.remove(id);
  }
}