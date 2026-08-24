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
  ) {
    return this.dashboardService.getClientesStats(periodo);
  }
}
