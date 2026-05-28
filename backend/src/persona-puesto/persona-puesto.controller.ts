import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PersonaPuestoService } from './persona-puesto.service';
import { CreatePersonaPuestoDto } from './dto/create-persona-puesto.dto';
import { UpdatePersonaPuestoDto } from './dto/update-persona-puesto.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@ApiTags('Asignación Persona-Puesto')
@Controller('persona-puesto')
@UseGuards(JwtAuthGuard, AccessGuard)
export class PersonaPuestoController {
  constructor(private readonly personaPuestoService: PersonaPuestoService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Asignar un puesto y departamento a una persona' })
  create(@Body() createPersonaPuestoDto: CreatePersonaPuestoDto) {
    return this.personaPuestoService.create(createPersonaPuestoDto);
  }

  @Get()
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Listar todas las asignaciones de puestos activas' })
  findAll() {
    return this.personaPuestoService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaPuestoService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Actualizar detalles de asignación' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePersonaPuestoDto: UpdatePersonaPuestoDto) {
    return this.personaPuestoService.update(id, updatePersonaPuestoDto);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Remover asignación de puesto (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personaPuestoService.remove(id);
  }
}