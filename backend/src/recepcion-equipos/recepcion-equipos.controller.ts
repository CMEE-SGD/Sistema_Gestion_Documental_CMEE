import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RecepcionEquiposService } from './recepcion-equipos.service';
import { CreateRecepcionEquipoDto } from './dto/create-recepcion-equipo.dto';
import { UpdateRecepcionEquipoDto } from './dto/update-recepcion-equipo.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recepcion-equipos')
export class RecepcionEquiposController {
  constructor(private readonly recepcionService: RecepcionEquiposService) {}

  @Post()
  create(@Body() createDto: CreateRecepcionEquipoDto) {
    return this.recepcionService.create(createDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.recepcionService.findAll(req.user);
  }

  @Get('laboratorio/:laboratorioId/pendientes')
  findPendientesByLaboratorio(@Param('laboratorioId') laboratorioId: string) {
    return this.recepcionService.findPendientesByLaboratorio(+laboratorioId);
  }

  @Get('tecnico/:tecnicoId/pendientes')
  findPendientesByTecnico(@Param('tecnicoId') tecnicoId: string) {
    return this.recepcionService.findPendientesByTecnico(+tecnicoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recepcionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateRecepcionEquipoDto) {
    return this.recepcionService.update(+id, updateDto);
  }

  @Patch(':id/asignar-tecnico')
  asignarTecnico(@Param('id') id: string, @Body() dto: AsignarTecnicoDto) {
    return this.recepcionService.asignarTecnico(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recepcionService.remove(+id);
  }
}
