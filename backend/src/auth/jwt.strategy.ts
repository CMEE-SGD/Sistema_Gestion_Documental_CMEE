// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad JwtStrategy. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clave_secreta_desarrollo', // Usa variables de entorno en prod
    });
  }

  /**
   * Valida el payload del token. Si el token fue firmado con `jwtid`
   * (sesión revocable), exige que exista una SesionActiva vigente.
   * @param payload - Datos o identificador requerido (any)
   * @returns Promise<{ id: any; isGod: any; jti: any; }>
   */
  async validate(payload: any) {
    // El usuario "Dios" (in-memory) no tiene sesión en BD; se permite tal cual.
    if (!payload.isGod && payload.jti) {
      const sesion = await this.prisma.sesionActiva.findUnique({
        where: { token_jti: payload.jti },
      });

      if (!sesion) {
        throw new UnauthorizedException('Sesión no válida');
      }
      if (sesion.fecha_cierre) {
        throw new UnauthorizedException(
          'Sesión cerrada. Vuelva a iniciar sesión.',
        );
      }
      if (sesion.fecha_expiracion < new Date()) {
        throw new UnauthorizedException('Sesión expirada');
      }
      if (sesion.en_espera) {
        throw new UnauthorizedException(
          'Su acceso está pendiente de aprobación por un administrador.',
        );
      }

      // Cierre por inactividad del lado del servidor — no depende de que el
      // temporizador de JS del navegador (useInactividad.ts) llegue a
      // ejecutarse; si la pestaña queda en segundo plano, la laptop se
      // suspende, o el navegador la descarta para ahorrar memoria, ese
      // temporizador nunca corre y la sesión quedaba "abierta" hasta las 8h
      // de expiración absoluta. Usa el mismo minuto configurado en
      // Configuración General (0 = desactivado) que ya promete la pantalla
      // de administración, pero que hasta ahora nadie leía.
      const config = await this.prisma.configuracionGeneral.findUnique({
        where: { id: 1 },
        select: { tiempo_inactividad_minutos: true },
      });
      const limiteMinutos = config?.tiempo_inactividad_minutos ?? 0;
      if (limiteMinutos > 0) {
        const limiteMs = limiteMinutos * 60 * 1000;
        const inactivaDesdeMs = Date.now() - sesion.ultima_actividad.getTime();
        if (inactivaDesdeMs > limiteMs) {
          await this.prisma.sesionActiva.update({
            where: { id: sesion.id },
            data: { fecha_cierre: new Date() },
          });
          throw new UnauthorizedException(
            'Sesión cerrada por inactividad. Vuelva a iniciar sesión.',
          );
        }
        // "Toque" de actividad, sin escribir en cada petición: solo si ya
        // pasaron 30s desde el último registro (evita golpear la BD en cada
        // llamada de una pantalla que hace varias peticiones seguidas).
        if (inactivaDesdeMs > 30_000) {
          await this.prisma.sesionActiva.update({
            where: { id: sesion.id },
            data: { ultima_actividad: new Date() },
          });
        }
      }

      // Un usuario SOLO puede tener una sesión activa. Si por cualquier
      // motivo (p.ej. dos inicios simultáneos) existen dos, se cierran todas
      // automáticamente y la solicitud actual queda sin sesión válida.
      const sesionesActivas = await this.prisma.sesionActiva.count({
        where: {
          usuario_id: sesion.usuario_id,
          fecha_cierre: null,
          en_espera: false,
        },
      });
      if (sesionesActivas > 1) {
        await this.prisma.sesionActiva.updateMany({
          where: {
            usuario_id: sesion.usuario_id,
            fecha_cierre: null,
          },
          data: {
            fecha_cierre: new Date(),
            updatedAt: new Date(),
          },
        });
        throw new UnauthorizedException(
          'Se detectaron sesiones duplicadas. Vuelva a iniciar sesión.',
        );
      }
    }

    // Retornamos el ID, la bandera isGod y el jti (si existe)
    return {
      id: payload.sub,
      isGod: payload.isGod || false, // Pasamos la bandera al request.user
      jti: payload.jti,
    };
  }
}