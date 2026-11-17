import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

// Ventana "próximos N días" del mapa de calor: 60 por defecto, tope de 10 años.
function parseDias(dias?: string): number {
  const n = Number.parseInt(dias ?? '', 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 3650) : 60;
}

@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clientes/stats')
  @RequireAccess('Resumen', 1)
  getClientesStats(
    @Query('periodo') periodo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.dashboardService.getClientesStats(periodo, mes, anio);
  }

  @Get('mapa-calor')
  @RequireAccess('Resumen', 1)
  getMapaCalor(@Query('dias') dias?: string) {
    return this.dashboardService.getMapaCalor(parseDias(dias));
  }

  @Get('mapa-calor/empresa/:id')
  @RequireAccess('Resumen', 1)
  getMapaCalorEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Query('dias') dias?: string,
  ) {
    return this.dashboardService.getMapaCalorEmpresa(id, parseDias(dias));
  }

  @Get('laboratorios/stats')
  @RequireAccess('Resumen', 1)
  getLaboratoriosStats(
    @Query('periodo') periodo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('laboratorioId') laboratorioId?: string,
  ) {
    return this.dashboardService.getLaboratoriosStats(periodo, mes, anio, fechaInicio, fechaFin, laboratorioId);
  }
}
