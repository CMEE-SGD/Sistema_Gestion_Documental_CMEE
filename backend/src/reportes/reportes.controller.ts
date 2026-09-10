import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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
  porLaboratorio(@Req() req: any) {
    return this.reportesService.porLaboratorio(req.user);
  }

  @Get('certificados-emitidos')
  certificadosEmitidos(
    @Req() req: any,
    @Query('laboratorio_id') laboratorioId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.certificadosEmitidos(
      laboratorioId ? Number(laboratorioId) : undefined,
      desde,
      hasta,
      req.user,
    );
  }

  @Get('certificados-pendientes')
  certificadosPendientes(
    @Req() req: any,
    @Query('laboratorio_id') laboratorioId?: string,
  ) {
    return this.reportesService.certificadosPendientes(
      laboratorioId ? Number(laboratorioId) : undefined,
      req.user,
    );
  }

  @Get('certificados-observados')
  certificadosObservados(
    @Req() req: any,
    @Query('laboratorio_id') laboratorioId?: string,
  ) {
    return this.reportesService.certificadosObservados(
      laboratorioId ? Number(laboratorioId) : undefined,
      req.user,
    );
  }

  @Get('tiempos-atencion')
  tiemposAtencion(
    @Req() req: any,
    @Query('laboratorio_id') laboratorioId?: string,
  ) {
    return this.reportesService.tiemposAtencion(
      laboratorioId ? Number(laboratorioId) : undefined,
      req.user,
    );
  }

  @Get('calidad')
  calidad(@Req() req: any, @Query('laboratorio_id') laboratorioId?: string) {
    return this.reportesService.calidad(
      laboratorioId ? Number(laboratorioId) : undefined,
      req.user,
    );
  }

  @Get('administrativo')
  administrativo(
    @Req() req: any,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportesService.administrativo(desde, hasta, req.user);
  }
}
