import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva persona con sus roles' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las personas activas' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por ID con sus roles y puestos' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una persona y sus roles' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una persona (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}