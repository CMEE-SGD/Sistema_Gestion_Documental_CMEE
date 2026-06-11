import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('circuitos')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5) // Nivel 5: Creación
  create(@Body() createCircuitoDto: CreateCircuitoDto) {
    return this.circuitosService.create(createCircuitoDto);
  }

  @Get()
  @RequireAccess('Recursos Humanos', 2) // Nivel 2: Lectura
  findAll() {
    return this.circuitosService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id') id: string) {
    return this.circuitosService.findOne(+id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 4) // Nivel 4: Edición
  update(@Param('id') id: string, @Body() updateCircuitoDto: UpdateCircuitoDto) {
    return this.circuitosService.update(+id, updateCircuitoDto);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5) // Nivel 5: Eliminación
  remove(@Param('id') id: string) {
    return this.circuitosService.remove(+id);
  }

  @Post(':id/fases')
  @RequireAccess('Recursos Humanos', 4) // Nivel 4: Modificar fases es una edición
  saveFase(@Param('id') id: string, @Body() data: any) {
    return this.circuitosService.saveFase(+id, data);
  }

  @Get(':circuitoId/fases')
  @RequireAccess('Recursos Humanos', 2)
  getFases(@Param('circuitoId') circuitoId: string) {
    return this.circuitosService.getFases(+circuitoId);
  }

  @Get(':circuitoId/fases/:faseId')
  @RequireAccess('Recursos Humanos', 2)
  getFase(@Param('faseId') faseId: string) {
    return this.circuitosService.getFase(+faseId);
  }
}