import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Roles') // Agrupa en Swagger
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles activos' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { // ParseIntPipe asegura que sea número
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol parcialmente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRolDto: UpdateRolDto) {
    return this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un rol (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}