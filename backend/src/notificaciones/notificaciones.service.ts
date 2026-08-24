import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesGateway } from './notificaciones.gateway';

@Injectable()
export class NotificacionesService {
  constructor(
    private prisma: PrismaService,
    private notificacionesGateway: NotificacionesGateway,
  ) {}

  async crear(tipo: string, mensaje: string, personaId: number, referenciaId?: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { persona_id: personaId },
      select: { id: true },
    });
    if (!usuario) return;

    const notificacion = await this.prisma.notificacion.create({
      data: {
        usuario_id: usuario.id,
        tipo,
        mensaje,
        referencia_id: referenciaId,
      },
    });

    this.notificacionesGateway.emitirNotificacion(usuario.id, notificacion);
    const conteo = await this.noLeidas(usuario.id);
    this.notificacionesGateway.emitirConteo(usuario.id, conteo);

    return notificacion;
  }

  async listar(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async noLeidas(usuarioId: number) {
    return this.prisma.notificacion.count({
      where: { usuario_id: usuarioId, leido: false },
    });
  }

  async marcarLeida(id: number, usuarioId: number) {
    return this.prisma.notificacion.updateMany({
      where: { id, usuario_id: usuarioId },
      data: { leido: true },
    });
  }

  async marcarTodasLeidas(usuarioId: number) {
    return this.prisma.notificacion.updateMany({
      where: { usuario_id: usuarioId, leido: false },
      data: { leido: true },
    });
  }
}
