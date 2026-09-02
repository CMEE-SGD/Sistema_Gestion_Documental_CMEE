import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

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
