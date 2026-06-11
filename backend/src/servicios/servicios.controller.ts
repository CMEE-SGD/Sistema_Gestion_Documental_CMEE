import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('servicios')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @RequireAccess('Laboratorios', 5) // Nivel 5: Creación
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  @RequireAccess('Laboratorios', 2) // Nivel 2: Lectura
  findAll() {
    return this.serviciosService.findAll();
  }

  @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Laboratorios', 4) // Nivel 4: Edición
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateServicioDto: UpdateServicioDto
  ) {
    return this.serviciosService.update(id, updateServicioDto);
  }

  @Delete(':id')
  @RequireAccess('Laboratorios', 5) // Nivel 5: Eliminación/Desactivación
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.remove(id);
  }
}