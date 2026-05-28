import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(JwtAuthGuard, AccessGuard)
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  @RequireAccess('Gestion de Usuarios', 5)
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  @Get()
  @RequireAccess('Gestion de Usuarios', 5)
  findAll() {
    return this.gruposService.findAll();
  }

  @Get(':id')
  @RequireAccess('Gestion de Usuarios', 5)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Gestion de Usuarios', 5)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(id, updateGrupoDto);
  }

  @Delete(':id')
  @RequireAccess('Gestion de Usuarios', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.remove(id);
  }
}