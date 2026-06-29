import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad AccessGuard. */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  /**
   * Ejecuta la operación de negocio canActivate.
   * @param context - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Promise<boolean>
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Leemos qué exige la ruta
    const requiredAccess = this.reflector.get<{ app: string; level: number }>(
      'access',
      context.getHandler(),
    );
    if (!requiredAccess) return true;

    // 2. Extraemos el usuario inyectado por el JwtStrategy
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user; // Esto viene del validate() del jwt.strategy.ts

    if (!userPayload || !userPayload.id) {
      throw new ForbiddenException('No hay un token de autenticación válido');
    }

    // 👇 3. LA EXCEPCIÓN DEL USUARIO EN MEMORIA (GOD MODE)
    if (userPayload.isGod === true && userPayload.id === -1) {
      // Si es el usuario "Dios", le damos acceso libre a absolutamente todo
      return true;
    }

    // 4. Lógica normal para los usuarios de la Base de Datos
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userPayload.id },
      include: {
        grupos: {
          include: {
            aplicaciones: {
              include: { aplicacion: true },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.estado_cuenta || usuario.bloqueado) {
      throw new ForbiddenException('El usuario no existe o está inactivo');
    }

    // 5. Verificamos los niveles
    const tienePermiso = usuario.grupos.some((grupo) =>
      grupo.aplicaciones.some(
        (appConfig) =>
          appConfig.aplicacion.nombre === requiredAccess.app &&
          appConfig.nivel >= requiredAccess.level,
      ),
    );

    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado: Requiere nivel ${requiredAccess.level} en ${requiredAccess.app}`,
      );
    }

    return true;
  }
}
