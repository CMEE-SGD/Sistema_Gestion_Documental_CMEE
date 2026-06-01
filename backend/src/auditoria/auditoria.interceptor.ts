import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
    constructor(private readonly auditoriaService: AuditoriaService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user } = req;

        // next.handle() procesa la ruta normalmente. tap() ejecuta código después de una respuesta exitosa.
        return next.handle().pipe(
        tap(() => {
            // Solo auditamos si hay un usuario autenticado (JWT)
            if (user && user.id) {
            let accion = 'Consulta'; // Por defecto para GET
            if (method === 'POST') accion = 'Creación';
            if (method === 'PATCH' || method === 'PUT') accion = 'Edición';
            if (method === 'DELETE') accion = 'Eliminación lógica';

            // Extraemos el módulo de la URL (Ej: /api/personas -> PERSONAS)
            const modulo = url.split('/')[2]?.toUpperCase() || 'SISTEMA';

            // Guardamos el log asíncronamente
            this.auditoriaService.registrarLog({
                usuario_id: user.id,
                modulo: modulo,
                accion: `${accion} de recurso`,
                descripcion: `Endpoint: ${method} ${url}`,
            }).catch(err => console.error('Error guardando auditoría:', err));
            }
        }),
        );
    }
}