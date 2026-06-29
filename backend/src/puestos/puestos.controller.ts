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
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Puestos. */
@ApiTags('Puestos')
@Controller('puestos')
@UseGuards(JwtAuthGuard, AccessGuard)
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createPuestoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post()
  @RequireAccess('Recursos Humanos', 5) // PDF: "Introducir Puestos" = 5
  @ApiOperation({ summary: 'Crear un nuevo puesto' })
  create(@Body() createPuestoDto: CreatePuestoDto) {
    return this.puestosService.create(createPuestoDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  @Get()
  @RequireAccess('Recursos Humanos', 1)
  @ApiOperation({ summary: 'Listar puestos activos (incluye padre)' })
  findAll() {
    return this.puestosService.findAll();
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener un puesto por ID (incluye padre e hijos)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.puestosService.findOne(id);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updatePuestoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5) // PDF: "Editar Ficha de Puestos" = 5
  @ApiOperation({ summary: 'Actualizar un puesto parcialmente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePuestoDto: UpdatePuestoDto,
  ) {
    return this.puestosService.update(id, updatePuestoDto);
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar un puesto (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.puestosService.remove(id);
  }
}
