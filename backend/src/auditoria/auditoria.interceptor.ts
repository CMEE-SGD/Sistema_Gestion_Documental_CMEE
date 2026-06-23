import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
    // 👇 1. Creamos un caché temporal en memoria
    private cacheGet = new Map<string, number>();

    constructor(private readonly auditoriaService: AuditoriaService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user } = req;

        return next.handle().pipe(
        tap(() => {
            if (user && user.id) {
            // 👇 2. Lógica para evitar duplicados exactos en GET por React Strict Mode
            if (method === 'GET') {
                const cacheKey = `${user.id}-${url}`;
                const ahora = Date.now();
                const ultimaVez = this.cacheGet.get(cacheKey) || 0;
                
                // Si pasaron menos de 2 segundos desde el último GET exacto, lo ignoramos
                if (ahora - ultimaVez < 2000) return; 
                
                this.cacheGet.set(cacheKey, ahora); // Actualizamos el tiempo
            }

            let accion = 'Consulta'; 
            if (method === 'POST') accion = 'Creación';
            if (method === 'PATCH' || method === 'PUT') accion = 'Edición';
            if (method === 'DELETE') accion = 'Eliminación lógica';

            const partesUrl = url.split('?')[0].split('/'); 
            const modulo = partesUrl[2]?.toUpperCase() || 'SISTEMA'; 
            
            const ultimoParametro = parseInt(partesUrl[partesUrl.length - 1]);
            const tieneId = !isNaN(ultimoParametro);

            const esGetGeneral = method === 'GET' && !tieneId;

            if (!esGetGeneral) {
                let persona_afectada_id = null;
                let documento_id = null;
                let rol_afectado_id = null;    
                let puesto_afectado_id = null; 

                if (tieneId) {
                if (modulo === 'PERSONAS') persona_afectada_id = ultimoParametro;
                if (modulo === 'ROLES') rol_afectado_id = ultimoParametro;       
                if (modulo === 'PUESTOS') puesto_afectado_id = ultimoParametro;    
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