import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LaboratoriosService } from './laboratorios.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('laboratorios')
@UseGuards(JwtAuthGuard, AccessGuard)
export class LaboratoriosController {
  constructor(private readonly laboratoriosService: LaboratoriosService) {}

  @Post()
  @RequireAccess('Laboratorios', 5)
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratoriosService.create(createLaboratorioDto);
  }

  @Get()
  @RequireAccess('Laboratorios', 2)
  findAll() {
    return this.laboratoriosService.findAll();
  }

  @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Laboratorios', 4)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLaboratorioDto: UpdateLaboratorioDto) {
    return this.laboratoriosService.update(id, updateLaboratorioDto);
  }

  @Delete(':id')
  @RequireAccess('Laboratorios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.remove(id);
  }
}