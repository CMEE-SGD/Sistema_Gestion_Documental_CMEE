import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Puedes agregar decoradores de Swagger aquí

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clientes/stats')
  getClientesStats(
    @Query('periodo') periodo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.dashboardService.getClientesStats(periodo, mes, anio);
  }

  @Get('laboratorios/stats')
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
