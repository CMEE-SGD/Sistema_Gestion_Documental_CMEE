import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service';
import { etiquetaModulo } from './modulo-labels';

const CAMPOS_SENSIBLES = [
  'password',
  'clave',
  'contrasena',
  'contraseña',
  'pass',
  'token',
];
const CAMPOS_DESTACADOS = [
  'nombre',
  'titulo',
  'estado',
  'accion',
  'orden_trabajo_fisica',
  'nombre_usuario',
  'email',
  'email_1',
  'codigo',
];
const LARGO_MAXIMO_DETALLE = 4000;

/** Oculta valores de campos sensibles (contraseñas, tokens) antes de guardarlos en la bitácora. */
function sanitizarBody(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const limpio: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(
    body as Record<string, unknown>,
  )) {
    const esSensible = CAMPOS_SENSIBLES.some((c) =>
      clave.toLowerCase().includes(c),
    );
    limpio[clave] = esSensible ? '••••••' : valor;
  }
  return limpio;
}

function serializarDetalle(body: unknown): string | null {
  const limpio = sanitizarBody(body);
  if (!limpio || Object.keys(limpio).length === 0) return null;

  try {
    const json = JSON.stringify(limpio);
    return json.length > LARGO_MAXIMO_DETALLE
      ? `${json.slice(0, LARGO_MAXIMO_DETALLE)}…`
      : json;
  } catch {
    return null;
  }
}

/** Elige un campo representativo del payload para mostrar en la descripción. */
function campoDestacado(body: unknown): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const registro = body as Record<string, unknown>;

  for (const campo of CAMPOS_DESTACADOS) {
    const valor = registro[campo];
    if (valor !== undefined && valor !== null && valor !== '') {
      return String(valor);
    }
  }
  return null;
}

function construirDescripcion(params: {
  accionLabel: string;
  modulo: string;
  tieneId: boolean;
  id: number;
  body: unknown;
}): string {
  const { accionLabel, modulo, tieneId, id, body } = params;
  let descripcion = `${accionLabel} en ${etiquetaModulo(modulo)}`;
  if (tieneId) descripcion += ` #${id}`;

  const destacado = campoDestacado(body);
  if (destacado) descripcion += ` — ${destacado}`;

  return descripcion;
}

/** Módulo controlador o servicio para gestionar la entidad AuditoriaInterceptor. */
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  // 👇 1. Creamos un caché temporal en memoria
  private cacheGet = new Map<string, number>();

  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * Ejecuta la operación de negocio intercept.
   * @param context - Datos o identificador requerido (Entidad | PrismaResponse)
   * @param next - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Entidad | PrismaResponse
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, body } = req;

    return next.handle().pipe(
      tap(() => {
        if (user && user.id && !user.isGod) {
          // El usuario Root (God, id=-1) no existe físicamente en la BD;
          // omitimos su auditoría para evitar violación de FK (P2003).
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

            // En DELETE no se llenan las FK dedicadas: para módulos con
            // borrado físico (ej. documentos) el registro ya no existe para
            // cuando este interceptor corre (se ejecuta después del handler),
            // así que insertar una fila que apunte a un id inexistente viola
            // la foreign key (P2003). `entidad_id` (sin FK) ya identifica el
            // recurso eliminado sin ese riesgo, sin importar si el borrado
            // fue lógico o físico.
            if (tieneId && method !== 'DELETE') {
              if (modulo === 'PERSONAS') persona_afectada_id = ultimoParametro;
              if (modulo === 'ROLES') rol_afectado_id = ultimoParametro;
              if (modulo === 'PUESTOS') puesto_afectado_id = ultimoParametro;
              if (modulo === 'DOCUMENTOS' || modulo === 'CARPETAS')
                documento_id = ultimoParametro;
            }

            const esMutacion = ['POST', 'PATCH', 'PUT'].includes(method);

            this.auditoriaService
              .registrarLog({
                usuario_id: user.id,
                modulo,
                accion: `${accion} de recurso`,
                descripcion: construirDescripcion({
                  accionLabel: accion,
                  modulo,
                  tieneId,
                  id: ultimoParametro,
                  body,
                }),
                detalle: esMutacion ? serializarDetalle(body) : null,
                persona_afectada_id,
                documento_id,
                rol_afectado_id,
                puesto_afectado_id,
                entidad_id: tieneId ? ultimoParametro : null,
              })
              .catch((err) => console.error('Error guardando auditoría:', err));
          }
        }
      }),
    );
  }
}
