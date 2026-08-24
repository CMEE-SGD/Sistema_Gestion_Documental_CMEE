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
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Departamentos. */
@ApiTags('Departamentos')
@Controller('departamentos')
@UseGuards(JwtAuthGuard, AccessGuard)
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createDepartamentoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentosService.create(createDepartamentoDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  @Get()
  @RequireAccess('Recursos Humanos', 1)
  @ApiOperation({ summary: 'Listar departamentos activos (incluye padre)' })
  findAll() {
    return this.departamentosService.findAll();
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({
    summary: 'Obtener un departamento por ID (incluye padre e hijos)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updateDepartamentoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Actualizar un departamento parcialmente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar un departamento (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }
}
