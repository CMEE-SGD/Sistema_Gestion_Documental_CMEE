// Constantes del GD4.1.F1-1 — Registro y control de trabajos de ensayo y/o
// calibración no conformes. Se comparten entre listado, detalle y formulario.

export interface OpcionValor {
    valor: string;
    label: string;
}

export const CATEGORIAS: OpcionValor[] = [
    { valor: 'EQUIPO', label: 'Equipo' },
    { valor: 'INSUMOS', label: 'Insumos' },
    { valor: 'MATERIAL', label: 'Material' },
    { valor: 'SERVICIO_CONTRATADO', label: 'Servicio contratado' },
    { valor: 'CALIBRACION', label: 'Calibración' },
    { valor: 'ENSAYO', label: 'Ensayo/Caracterización' },
    { valor: 'CERTIFICADO', label: 'Certificado' },
    { valor: 'REPORTE', label: 'Reporte' },
    { valor: 'OTRO', label: 'Otro' },
];

export const ACCIONES_TOMADAS: OpcionValor[] = [
    { valor: 'SUSPENDER', label: 'Suspender' },
    { valor: 'CORREGIR', label: 'Corregir' },
    { valor: 'RECHAZAR', label: 'Rechazar' },
    { valor: 'DESECHAR', label: 'Desechar' },
    { valor: 'RETIRAR', label: 'Retirar' },
    { valor: 'REPETIR', label: 'Repetir' },
    { valor: 'OTRO', label: 'Otro' },
];

export const ESTADO_LABEL: Record<string, string> = {
    REGISTRADA: 'Registrada',
    EN_TRATAMIENTO: 'En tratamiento',
    EN_SEGUIMIENTO: 'En seguimiento',
    CERRADA: 'Cerrada',
};

export const ESTADO_STYLES: Record<string, string> = {
    REGISTRADA: 'bg-gray-100 text-gray-700',
    EN_TRATAMIENTO: 'bg-amber-100 text-amber-700',
    EN_SEGUIMIENTO: 'bg-blue-100 text-blue-700',
    CERRADA: 'bg-emerald-100 text-emerald-700',
};

/**
 * Replica la lógica del backend (calcularEstadoTrabajoNC) para mostrar en el
 * formulario el estado que resultará al guardar. El backend sigue siendo la
 * fuente de verdad.
 */
export const calcularEstado = (d: {
    fecha_cierre?: string | null;
    eficaz?: boolean | null;
    tratamiento_descripcion?: string | null;
}): string => {
    if (d.fecha_cierre) return 'CERRADA';
    if (d.eficaz !== null && d.eficaz !== undefined) return 'EN_SEGUIMIENTO';
    if (d.tratamiento_descripcion) return 'EN_TRATAMIENTO';
    return 'REGISTRADA';
};

export const etiquetaCategoria = (valor?: string | null): string =>
    CATEGORIAS.find((c) => c.valor === valor)?.label || valor || '—';

/**
 * `acciones_tomadas` se guarda como array de códigos (Json en Postgres);
 * aquí se convierten a sus etiquetas legibles.
 */
export const etiquetasAcciones = (valores?: unknown): string[] => {
    if (!Array.isArray(valores)) return [];
    return valores.map((v) => ACCIONES_TOMADAS.find((a) => a.valor === v)?.label || String(v));
};

/**
 * Fecha local en formato YYYY-MM-DD, para los inputs `type="date"`.
 */
export const hoy = (): string => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
};

/**
 * Las fechas llegan como 'YYYY-MM-DDT00:00:00.000Z' (columna DATE de Postgres).
 * Se formatea desde el primer tramo del ISO para no desplazar el día en zonas
 * con desfase negativo (Ecuador es UTC-5).
 */
export const formatearFecha = (fecha?: string | null): string => {
    if (!fecha) return '—';
    const [anio, mes, dia] = fecha.slice(0, 10).split('-');
    if (!anio || !mes || !dia) return '—';
    return `${dia}/${mes}/${anio}`;
};
