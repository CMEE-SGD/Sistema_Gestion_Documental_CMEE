import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('capacitaciones')
@UseGuards(JwtAuthGuard, AccessGuard)
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5)
  create(@Body() dto: CreateCapacitacionDto) {
    return this.capacitacionesService.create(dto);
  }

  @Get()
  @RequireAccess('Recursos Humanos', 1)
  findAll() {
    return this.capacitacionesService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCapacitacionDto) {
    return this.capacitacionesService.update(id, dto);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.remove(id);
  }
}
