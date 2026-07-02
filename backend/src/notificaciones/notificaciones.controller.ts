import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  listar(@Req() req: any) {
    return this.notificacionesService.listar(req.user.id);
  }

  @Get('no-leidas')
  noLeidas(@Req() req: any) {
    return this.notificacionesService.noLeidas(req.user.id);
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string, @Req() req: any) {
    return this.notificacionesService.marcarLeida(+id, req.user.id);
  }

  @Patch('leer-todas')
  marcarTodasLeidas(@Req() req: any) {
    return this.notificacionesService.marcarTodasLeidas(req.user.id);
  }
}
