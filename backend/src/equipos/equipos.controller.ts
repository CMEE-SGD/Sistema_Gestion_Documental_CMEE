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
  Req,
} from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Equipos. */
@Controller('equipos')
@UseGuards(JwtAuthGuard, AccessGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createEquipoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Entidad | PrismaResponse
   */
  @Post()
  @RequireAccess('Laboratorios', 5)
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Array<Entidad>
   */
  @Get()
  @RequireAccess('Laboratorios', 2)
  findAll(@Req() req: any) {
    return this.equiposService.findAll(req.user);
  }

  @Get('estados')
  @RequireAccess('Laboratorios', 2)
  getEstados() {
    return this.equiposService.getEstados();
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Entidad | PrismaResponse
   */
  @Get(':id')
  @RequireAccess('Laboratorios', 2)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.equiposService.findOne(id, req.user);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updateEquipoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Entidad | PrismaResponse
   */
  @Patch(':id')
  @RequireAccess('Laboratorios', 4)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEquipoDto: UpdateEquipoDto,
    @Req() req: any,
  ) {
    return this.equiposService.update(id, updateEquipoDto, req.user);
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Entidad | PrismaResponse
   */
  @Delete(':id')
  @RequireAccess('Laboratorios', 5)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.equiposService.remove(id, req.user);
  }

  @Patch(':id/reactivar')
  @RequireAccess('Laboratorios', 5)
  reactivar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.equiposService.reactivar(id, req.user);
  }
}
