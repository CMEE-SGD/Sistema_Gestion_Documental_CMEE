import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notificaciones',
})
export class NotificacionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      if (!token) return client.disconnect();

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      if (!userId) return client.disconnect();

      client.data.userId = userId;
      client.join(`user_${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {}

  emitirNotificacion(usuarioId: number, notificacion: any) {
    this.server.to(`user_${usuarioId}`).emit('notificacion', notificacion);
  }

  emitirConteo(usuarioId: number, noLeidas: number) {
    this.server.to(`user_${usuarioId}`).emit('no-leidas', noLeidas);
  }

  /** Avisa al usuario en vivo que su sesión fue cerrada/revocada. */
  emitirSesionCerrada(usuarioId: number) {
    this.server.to(`user_${usuarioId}`).emit('sesion-cerrada');
  }

  /**
   * Avisa a todos los clientes conectados que algo cambió en el flujo de
   * Recepción de Equipos (nueva orden, reasignación de técnico, cambio de
   * estado, certificado subido/firmado) para que las pantallas que lo
   * muestran se refresquen solas, sin que el usuario tenga que recargar la
   * página. No viaja ningún dato del equipo por el socket — es solo una
   * señal; cada cliente vuelve a pedir lo suyo por REST, que ya queda scoped
   * por laboratorio/puesto ahí mismo.
   */
  emitirRecepcionActualizada() {
    this.server.emit('recepcion-equipos-actualizado');
  }
}
