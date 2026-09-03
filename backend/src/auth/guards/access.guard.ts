import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessRequirement } from '../decorators/access.decorator';

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
    // 1. Leemos qué exige la ruta (una o varias alternativas — basta con
    // cumplir una sola, ver access.decorator.ts)
    const requiredAccess = this.reflector.get<AccessRequirement[]>(
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
        persona: {
          select: {
            id: true,
            puestos: {
              where: { activo: true },
              orderBy: { orden_puesto: 'asc' },
              take: 1,
              include: {
                puesto: { select: { nombre: true } },
                departamento: {
                  select: { laboratorio_id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!usuario || !usuario.estado_cuenta || usuario.bloqueado) {
      throw new ForbiddenException('El usuario no existe o está inactivo');
    }

    // 4.1 Hidratamos request.user con persona_id/puesto/laboratorio_id —
    // el JWT solo lleva { sub, isGod }, así que sin esto cualquier chequeo
    // de "isRestrictedToLab" en los servicios recibía siempre undefined y
    // nunca se activaba, para ningún usuario.
    const puestoActivo = usuario.persona?.puestos?.[0];
    request.user.persona_id = usuario.persona?.id ?? null;
    request.user.puesto = puestoActivo?.puesto?.nombre ?? null;
    request.user.laboratorio_id =
      puestoActivo?.departamento?.laboratorio_id ?? null;

    // 5. Verificamos los niveles: basta con cumplir UNA de las alternativas
    const tienePermiso = requiredAccess.some((req) =>
      usuario.grupos.some((grupo) =>
        grupo.aplicaciones.some(
          (appConfig) =>
            appConfig.aplicacion.nombre === req.app &&
            appConfig.nivel >= req.level,
        ),
      ),
    );

    if (!tienePermiso) {
      const detalle = requiredAccess
        .map((req) => `nivel ${req.level} en ${req.app}`)
        .join(' o ');
      throw new ForbiddenException(`Acceso denegado: Requiere ${detalle}`);
    }

    return true;
  }
}
