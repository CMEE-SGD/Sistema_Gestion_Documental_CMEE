import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Roles. */
@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, AccessGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  
  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param createRolDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  /**
     * Obtiene información de múltiples registros.
     * @returns Array<Entidad>
     */
    @Get()
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Listar todos los roles activos' })
  findAll() {
    return this.rolesService.findAll();
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  /**
     * Actualiza parcialmente la información de un registro existente.
     * @param id - Datos o identificador requerido (number)
     * @param updateRolDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Actualizar un rol parcialmente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRolDto: UpdateRolDto) {
    return this.rolesService.update(id, updateRolDto);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar un rol (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}