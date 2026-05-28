import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccessGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Leemos qué exige la ruta (Ej: { app: 'Gestor de Usuarios', level: 5 })
        const requiredAccess = this.reflector.get<{ app: string; level: number }>('access', context.getHandler());
        if (!requiredAccess) return true; // Si la ruta no exige nada, pasa directo

        // 2. Extraemos el ID del usuario inyectado por el token en la Fase 1
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;

        if (!userId) {
        throw new ForbiddenException('No hay un token de autenticación válido');
        }

        // 3. Consultamos a la base de datos los niveles reales en este preciso momento
        const usuario = await this.prisma.usuario.findUnique({
        where: { id: userId },
        include: {
            grupos: {
            include: {
                aplicaciones: {
                include: { aplicacion: true } // Traemos el nombre de la app y el nivel
                }
            }
            }
        }
        });

        if (!usuario || !usuario.estado_cuenta || usuario.bloqueado) {
        throw new ForbiddenException('El usuario no existe o está inactivo');
        }

        // 4. Verificamos si en alguno de sus grupos cumple con el nivel exigido para esa app
        const tienePermiso = usuario.grupos.some(grupo => 
        grupo.aplicaciones.some(appConfig => 
            appConfig.aplicacion.nombre === requiredAccess.app && 
            appConfig.nivel >= requiredAccess.level
        )
        );

        if (!tienePermiso) {
        throw new ForbiddenException(`Acceso denegado: Requiere nivel ${requiredAccess.level} en ${requiredAccess.app}`);
        }

        return true;
    }
}