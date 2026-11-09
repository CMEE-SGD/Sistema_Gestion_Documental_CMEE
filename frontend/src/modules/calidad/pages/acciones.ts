// Constantes del registro central de acciones correctivas / preventivas (MC21).
import { encodeId } from '../../../shared/utils/ids';

export type OrigenAccion = 'AUDITORIA_NC' | 'QUEJA' | 'RIESGO' | 'TRABAJO_NC';

export const TIPO_LABEL: Record<string, string> = {
    CORRECTIVA: 'Correctiva',
    PREVENTIVA: 'Preventiva',
};

export const TIPO_STYLES: Record<string, string> = {
    CORRECTIVA: 'bg-red-100 text-red-700',
    PREVENTIVA: 'bg-blue-100 text-blue-700',
};

export const ORIGEN_LABEL: Record<string, string> = {
    AUDITORIA_NC: 'Auditoría (NC)',
    QUEJA: 'Queja',
    RIESGO: 'Riesgo / Oportunidad',
    TRABAJO_NC: 'Trabajo no conforme',
};

export const ESTADO_ACCION_LABEL: Record<string, string> = {
    ABIERTA: 'Abierta',
    EN_EJECUCION: 'En ejecución',
    VERIFICADA: 'Verificada',
    CERRADA: 'Cerrada',
};

export const ESTADO_ACCION_STYLES: Record<string, string> = {
    ABIERTA: 'bg-gray-100 text-gray-700',
    EN_EJECUCION: 'bg-amber-100 text-amber-700',
    VERIFICADA: 'bg-blue-100 text-blue-700',
    CERRADA: 'bg-emerald-100 text-emerald-700',
};

/** "Grado Nombre Apellidos" de una persona (o '—' si no hay). */
export const nombrePersona = (p?: { grado?: string | null; nombre?: string; apellidos?: string } | null): string =>
    p ? [p.grado, p.nombre, p.apellidos].filter(Boolean).join(' ') : '—';

/** "Apellidos Nombre", para listas desplegables ordenadas por apellido. */
export const etiquetaPersonaOrdenada = (p: { nombre?: string; apellidos?: string }): string =>
    [p.apellidos, p.nombre].filter(Boolean).join(' ');

/** Personas ordenadas alfabéticamente por apellidos y luego por nombre. */
export const ordenarPersonas = <T extends { nombre?: string; apellidos?: string }>(personas: T[]): T[] =>
    [...personas].sort(
        (a, b) =>
            (a.apellidos || '').localeCompare(b.apellidos || '', 'es', { sensitivity: 'base' }) ||
            (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    );

export interface OrigenAccionInfo {
    tipo: OrigenAccion;
    id: number;
    codigo: string | null;
    auditoria_id: number | null;
}

/**
 * Ruta del detalle del registro al que pertenece la acción, o null si no se
 * puede resolver (origen dado de baja o NC sin auditoría).
 */
export const rutaOrigen = (origen?: OrigenAccionInfo | null): string | null => {
    if (!origen || !origen.codigo) return null;
    switch (origen.tipo) {
        case 'AUDITORIA_NC':
            return origen.auditoria_id
                ? `/calidad/auditorias/${encodeId(origen.auditoria_id)}/nc/${encodeId(origen.id)}`
                : null;
        case 'QUEJA':
            return `/calidad/quejas/${encodeId(origen.id)}`;
        case 'RIESGO':
            return `/calidad/riesgos/${encodeId(origen.id)}`;
        case 'TRABAJO_NC':
            return `/calidad/trabajos-no-conformes/${encodeId(origen.id)}`;
    }
};
