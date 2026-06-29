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
import { PersonaPuestoService } from './persona-puesto.service';
import { CreatePersonaPuestoDto } from './dto/create-persona-puesto.dto';
import { UpdatePersonaPuestoDto } from './dto/update-persona-puesto.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad PersonaPuesto. */
@ApiTags('Asignación Persona-Puesto')
@Controller('persona-puesto')
@UseGuards(JwtAuthGuard, AccessGuard)
export class PersonaPuestoController {
  constructor(private readonly personaPuestoService: PersonaPuestoService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createPersonaPuestoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Asignar un puesto y departamento a una persona' })
  create(@Body() createPersonaPuestoDto: CreatePersonaPuestoDto) {
    return this.personaPuestoService.create(createPersonaPuestoDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  @Get()
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Listar todas las asignaciones de puestos activas' })
  findAll() {
    return this.personaPuestoService.findAll();
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Entidad | PrismaResponse
   */
  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaPuestoService.findOne(id);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updatePersonaPuestoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Actualizar detalles de asignación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaPuestoDto: UpdatePersonaPuestoDto,
  ) {
    return this.personaPuestoService.update(id, updatePersonaPuestoDto);
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Remover asignación de puesto (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personaPuestoService.remove(id);
  }
}
