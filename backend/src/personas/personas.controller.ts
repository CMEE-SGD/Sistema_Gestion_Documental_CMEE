import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@ApiTags('Personas')
@Controller('personas')
@UseGuards(JwtAuthGuard, AccessGuard) // Protege todo el controlador
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5) // PDF: "Introducir Personas" = 5
  @ApiOperation({ summary: 'Crear una nueva persona con sus roles' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @RequireAccess('Recursos Humanos', 2) // PDF: Nivel 2 mínimo para ver operativas
  @ApiOperation({ summary: 'Listar todas las personas activas' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener una persona por ID con sus roles y puestos' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 4) // PDF: "Editar Ficha de Personas" = 4
  @ApiOperation({ summary: 'Actualizar datos de una persona y sus roles' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar una persona (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}