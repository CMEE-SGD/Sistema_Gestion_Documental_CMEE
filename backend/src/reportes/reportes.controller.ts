import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { ReportesService } from './reportes.service';

@Controller('reportes')
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess('Recepcion Equipos', 1)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('por-laboratorio')
  porLaboratorio() {
    return this.reportesService.porLaboratorio();
  }

  @Get('certificados-emitidos')
  certificadosEmitidos(
    @Query('laboratorio_id') laboratorioId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.certificadosEmitidos(
      laboratorioId ? Number(laboratorioId) : undefined,
      desde,
      hasta,
    );
  }

  @Get('certificados-pendientes')
  certificadosPendientes(@Query('laboratorio_id') laboratorioId?: string) {
    return this.reportesService.certificadosPendientes(
      laboratorioId ? Number(laboratorioId) : undefined,
    );
  }

  @Get('certificados-observados')
  certificadosObservados(@Query('laboratorio_id') laboratorioId?: string) {
    return this.reportesService.certificadosObservados(
      laboratorioId ? Number(laboratorioId) : undefined,
    );
  }

  @Get('tiempos-atencion')
  tiemposAtencion(@Query('laboratorio_id') laboratorioId?: string) {
    return this.reportesService.tiemposAtencion(
      laboratorioId ? Number(laboratorioId) : undefined,
    );
  }

  @Get('calidad')
  calidad(@Query('laboratorio_id') laboratorioId?: string) {
    return this.reportesService.calidad(
      laboratorioId ? Number(laboratorioId) : undefined,
    );
  }

  @Get('administrativo')
  administrativo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.administrativo(desde, hasta);
  }
}
