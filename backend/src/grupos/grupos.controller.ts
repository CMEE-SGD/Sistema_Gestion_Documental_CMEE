import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { ApiTags } from '@nestjs/swagger';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  @RequireAccess('Gestion de Usuarios', 5) // Nivel 5: Creación
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  @Get()
  @RequireAccess('Gestion de Usuarios', 2) // Nivel 2: Lectura (Para llenar dropdowns y tablas)
  findAll() {
    return this.gruposService.findAll();
  }

  @Get(':id')
  @RequireAccess('Gestion de Usuarios', 2) // Nivel 2: Lectura detallada
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Gestion de Usuarios', 4) // Nivel 4: Edición
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(id, updateGrupoDto);
  }

  @Delete(':id')
  @RequireAccess('Gestion de Usuarios', 5) // Nivel 5: Eliminación
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.remove(id);
  }
}