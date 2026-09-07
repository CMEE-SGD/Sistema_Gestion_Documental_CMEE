import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EstadoRecepcion } from '@prisma/client';
import { RecepcionEquiposService } from './recepcion-equipos.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { TransicionEstadoDto } from './dto/transicion-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('recepcion-equipos')
export class RecepcionEquiposController {
  constructor(private readonly recepcionService: RecepcionEquiposService) {}

  @Post()
  @RequireAccess('Recepcion Equipos', 3)
  create(@Body() createDto: CreateOrdenTrabajoDto) {
    return this.recepcionService.create(createDto);
  }

  @Get()
  @RequireAccess('Recepcion Equipos', 1)
  findAll(@Req() req: any) {
    return this.recepcionService.findAll(req.user);
  }

  @Get(':id')
  @RequireAccess('Recepcion Equipos', 1)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.recepcionService.findOne(+id, req.user);
  }

  @Patch(':id')
  @RequireAccess('Recepcion Equipos', 4)
  update(@Param('id') id: string, @Body() updateDto: UpdateOrdenTrabajoDto) {
    return this.recepcionService.update(+id, updateDto);
  }

  @Patch(':id/asignar-tecnico')
  @RequireAccess('Recepcion Equipos', 4)
  asignarTecnico(@Param('id') id: string, @Body() dto: AsignarTecnicoDto) {
    return this.recepcionService.asignarTecnico(+id, dto);
  }

  @Patch(':id/transicion-estado')
  @RequireAccess('Recepcion Equipos', 4)
  transicionEstado(
    @Param('id') id: string,
    @Body() dto: TransicionEstadoDto,
    @Req() req: any,
  ) {
    return this.recepcionService.transicionEstado(+id, dto, req.user);
  }

  // Diagnóstico de notificaciones: quién sería notificado para este equipo
  // si llegara a `estado`, sin crear ninguna notificación real. Nivel 5
  // (el más alto) a propósito, solo para administrar/depurar el flujo.
  @Get(':id/notificar-preview')
  @RequireAccess('Recepcion Equipos', 5)
  notificarPreview(
    @Param('id') id: string,
    @Query('estado') estado: EstadoRecepcion,
  ) {
    return this.recepcionService.previsualizarNotificacion(+id, estado);
  }

  @Delete(':id')
  @RequireAccess('Recepcion Equipos', 5)
  remove(@Param('id') id: string) {
    return this.recepcionService.remove(+id);
  }
}
