import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  @Post()
  create(@Body() createCircuitoDto: CreateCircuitoDto) {
    return this.circuitosService.create(createCircuitoDto);
  }

  @Get()
  findAll() {
    return this.circuitosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.circuitosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCircuitoDto: UpdateCircuitoDto) {
    return this.circuitosService.update(+id, updateCircuitoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.circuitosService.remove(+id);
  }

  @Post(':id/fases')
  saveFase(@Param('id') id: string, @Body() data: any) {
    return this.circuitosService.saveFase(+id, data);
  }

  // 👉 AQUÍ ESTÁ LA RUTA QUE FALTABA (Para la tabla de fases)
  @Get(':circuitoId/fases')
  getFases(@Param('circuitoId') circuitoId: string) {
    return this.circuitosService.getFases(+circuitoId);
  }

  // 👉 Esta es la ruta para la vista de Editar (Una sola fase)
  @Get(':circuitoId/fases/:faseId')
  getFase(@Param('faseId') faseId: string) {
    return this.circuitosService.getFase(+faseId);
  }
}