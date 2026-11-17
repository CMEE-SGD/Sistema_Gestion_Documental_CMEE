import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertasService } from './alertas.service';

/**
 * Alertas del usuario autenticado. No usa @RequireAccess a propósito: cualquier
 * usuario puede consultar el endpoint y el servicio incluye solo los grupos de
 * alertas de los módulos a los que tiene acceso.
 */
@Controller('alertas')
@UseGuards(JwtAuthGuard)
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  obtener(@Req() req: any) {
    return this.alertasService.obtener({ id: req.user.id, isGod: req.user.isGod });
  }
}
