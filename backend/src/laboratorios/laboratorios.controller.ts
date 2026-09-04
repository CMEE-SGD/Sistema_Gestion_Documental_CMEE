import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { LaboratoriosService } from './laboratorios.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { CrearDepartamentoVinculadoDto } from './dto/crear-departamento-vinculado.dto';
import { CreateSubAreaLaboratorioDto } from './dto/create-sub-area-laboratorio.dto';
import { UpdateSubAreaLaboratorioDto } from './dto/update-sub-area-laboratorio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Laboratorios. */
@Controller('laboratorios')
@UseGuards(JwtAuthGuard, AccessGuard)
export class LaboratoriosController {
  constructor(private readonly laboratoriosService: LaboratoriosService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createLaboratorioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post()
  @RequireAccess('Laboratorios', 5)
  create(@Body() createLaboratorioDto: CreateLaboratorioDto) {
    return this.laboratoriosService.create(createLaboratorioDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  // Recepción de Equipos también necesita este listado (desplegable de
  // laboratorio destino al crear una orden de trabajo), sin depender de
  // tener además permiso de Laboratorios. El Dashboard de Laboratorios
  // (módulo Resumen) también lo usa para el filtro por laboratorio.
  @Get()
  @RequireAccess([
    { app: 'Laboratorios', level: 2 },
    { app: 'Recepcion Equipos', level: 1 },
    { app: 'Resumen', level: 1 },
  ])
  findAll(@Req() req: any) {
    return this.laboratoriosService.findAll(req.user);
  }

  @Get('candidatos-responsable')
  @RequireAccess('Laboratorios', 2)
  getCandidatosResponsable(@Query('laboratorioId') laboratorioId?: string) {
    return this.laboratoriosService.getCandidatosResponsable(
      laboratorioId ? +laboratorioId : undefined,
    );
  }

  // Departamentos del organigrama (RRHH > Grupos) que todavía no están
  // enlazados a ningún laboratorio — para ofrecerlos en un desplegable en
  // vez de escribir el nombre a ciegas. Debe ir antes de @Get(':id') para
  // que Nest no interprete "departamentos-disponibles" como un :id.
  @Get('departamentos-disponibles')
  @RequireAccess('Laboratorios', 2)
  getDepartamentosDisponibles() {
    return this.laboratoriosService.getDepartamentosDisponibles();
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Array<Entidad>
   */
  @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.laboratoriosService.findOne(id, req.user);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updateLaboratorioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Patch(':id')
  @RequireAccess('Laboratorios', 4)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaboratorioDto: UpdateLaboratorioDto,
    @Req() req: any,
  ) {
    return this.laboratoriosService.update(id, updateLaboratorioDto, req.user);
  }

  @Delete(':id')
  @RequireAccess('Laboratorios', 5)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.laboratoriosService.remove(id, req.user);
  }

  @Patch(':id/reactivar')
  @RequireAccess('Laboratorios', 5)
  reactivar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.laboratoriosService.reactivar(id, req.user);
  }

  @Get(':id/departamentos')
  @RequireAccess('Laboratorios', 2)
  getDepartamentosVinculados(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.getDepartamentosVinculados(id);
  }

  // Mismo nivel que update() — vincular un Departamento es, en la práctica,
  // completar la configuración del laboratorio, no crear uno nuevo.
  @Patch(':id/departamentos/:departamentoId')
  @RequireAccess('Laboratorios', 4)
  vincularDepartamentoExistente(
    @Param('id', ParseIntPipe) id: number,
    @Param('departamentoId', ParseIntPipe) departamentoId: number,
  ) {
    return this.laboratoriosService.vincularDepartamentoExistente(
      id,
      departamentoId,
    );
  }

  @Post(':id/departamentos')
  @RequireAccess('Laboratorios', 4)
  crearDepartamentoVinculado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearDepartamentoVinculadoDto,
  ) {
    return this.laboratoriosService.crearDepartamentoVinculado(id, dto);
  }

  // Sub-áreas internas del laboratorio (ej. "Tiempo" / "Baja Frecuencia") —
  // catálogo propio de Laboratorios, sin relación con el organigrama de
  // RRHH ni con Departamento. También lo usa Recepción de Equipos para su
  // propio desplegable de sub-área, igual que el listado de arriba.
  @Get(':id/sub-areas')
  @RequireAccess([
    { app: 'Laboratorios', level: 2 },
    { app: 'Recepcion Equipos', level: 1 },
  ])
  getSubAreas(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriosService.getSubAreasVinculadas(id);
  }

  @Post(':id/sub-areas')
  @RequireAccess('Laboratorios', 4)
  crearSubArea(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubAreaLaboratorioDto,
  ) {
    return this.laboratoriosService.crearSubArea(id, dto);
  }

  @Patch(':id/sub-areas/:subAreaId')
  @RequireAccess('Laboratorios', 4)
  actualizarSubArea(
    @Param('id', ParseIntPipe) id: number,
    @Param('subAreaId', ParseIntPipe) subAreaId: number,
    @Body() dto: UpdateSubAreaLaboratorioDto,
  ) {
    return this.laboratoriosService.actualizarSubArea(id, subAreaId, dto);
  }
}
