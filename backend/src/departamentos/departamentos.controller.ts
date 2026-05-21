import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Departamentos')
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentosService.create(createDepartamentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar departamentos activos (incluye padre)' })
  findAll() {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID (incluye padre e hijos)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un departamento parcialmente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDepartamentoDto: UpdateDepartamentoDto) {
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un departamento (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }
}