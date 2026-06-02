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

    return next.handle().pipe(
      tap(() => {
        // Solo auditamos si hay un usuario autenticado
        if (user && user.id) {
            let accion = 'Consulta'; // Por defecto para GET
            if (method === 'POST') accion = 'Creación';
            if (method === 'PATCH' || method === 'PUT') accion = 'Edición';
            if (method === 'DELETE') accion = 'Eliminación lógica';

            // Extraemos el módulo y el posible ID de la URL
            const partesUrl = url.split('?')[0].split('/'); // Limpiamos query params
            const modulo = partesUrl[2]?.toUpperCase() || 'SISTEMA'; // Asumiendo /api/modulo/...
            
            // Verificamos si la URL termina en un número (ej. /api/personas/2)
            const ultimoParametro = parseInt(partesUrl[partesUrl.length - 1]);
            const tieneId = !isNaN(ultimoParametro);

            // 👇 FILTRO APLICADO: Ignoramos los GET generales que traen catálogos
            const esGetGeneral = method === 'GET' && !tieneId;

            // Solo guardamos el log si es un GET específico o una mutación (POST/PATCH/DELETE)
            if (!esGetGeneral) {
                let persona_afectada_id = null;
                let documento_id = null;
                let rol_afectado_id = null;    // NUEVO
                let puesto_afectado_id = null; // NUEVO

                if (tieneId) {
                if (modulo === 'PERSONAS') persona_afectada_id = ultimoParametro;
                if (modulo === 'ROLES') rol_afectado_id = ultimoParametro;       // NUEVO
                if (modulo === 'PUESTOS') puesto_afectado_id = ultimoParametro;    // NUEVO
                if (modulo === 'DOCUMENTOS' || modulo === 'CARPETAS') documento_id = ultimoParametro;
                }

                this.auditoriaService.registrarLog({
                    usuario_id: user.id,
                    modulo,
                    accion: `${accion} de recurso`,
                    descripcion: `Endpoint: ${method} ${url}`,
                    persona_afectada_id,
                    documento_id,
                    rol_afectado_id,
                    puesto_afectado_id,
                }).catch(err => console.error('Error guardando auditoría:', err));
            }
            }
        }),
        );
    }
}