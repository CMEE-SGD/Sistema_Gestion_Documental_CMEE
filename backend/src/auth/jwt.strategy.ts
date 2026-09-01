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
    }

    // Retornamos el ID, la bandera isGod y el jti (si existe)
    return {
      id: payload.sub,
      isGod: payload.isGod || false, // Pasamos la bandera al request.user
      jti: payload.jti,
    };
  }
}