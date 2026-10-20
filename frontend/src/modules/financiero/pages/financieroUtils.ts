// Utilidades compartidas del módulo financiero (proformas, facturas, cartera,
// próximas calibraciones) — formatos, badges y etiquetas consistentes.

export const fmtMoneda = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return 'USD 0,00';
  return (
    'USD ' +
    v.toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const fmtFecha = (s: string | null | undefined): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
};

export const ESTADO_FACTURA_LABEL: Record<string, string> = {
  EMITIDA: 'Emitida',
  PARCIAL: 'Pago parcial',
  PAGADA: 'Cobrada',
  ANULADA: 'Anulada',
};

export const ESTADO_FACTURA_STYLE: Record<string, string> = {
  EMITIDA: 'bg-blue-100 text-blue-800 border-blue-300',
  PARCIAL: 'bg-amber-100 text-amber-800 border-amber-300',
  PAGADA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  ANULADA: 'bg-red-100 text-red-700 border-red-300',
};

export const METODO_PAGO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  COMPENSACION: 'Entrega de equipos',
};

export const ESTADO_PROFORMA_LABEL: Record<string, string> = {
  EMITIDA: 'Emitida',
  ACEPTADA: 'Aceptada',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
};

export const ESTADO_PROFORMA_STYLE: Record<string, string> = {
  EMITIDA: 'bg-blue-100 text-blue-800 border-blue-300',
  ACEPTADA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  VENCIDA: 'bg-amber-100 text-amber-800 border-amber-300',
  CANCELADA: 'bg-red-100 text-red-700 border-red-300',
};

/** 30 por defecto; 60/90/120 elegibles por cualquier usuario de facturación. */
export const PLAZOS_CREDITO = [30, 60, 90, 120];

export function badgeClass(tone: string): string {
  return `inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${tone}`;
}

/** Input de formulario con el estilo base del módulo administrativo. */
export const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export const labelCls =
  'block text-xs font-medium text-slate-400 uppercase tracking-wide';

// ---------------------------------------------------------------------------
// Filtros por período de fechas (compartidos por órdenes, proformas y facturas)
// ---------------------------------------------------------------------------

export type PeriodoFechas =
  | 'todos'
  | 'ultimos30'
  | 'esteMes'
  | 'mesAnterior'
  | 'esteAnio'
  | 'personalizado';

export const OPCIONES_PERIODO: { id: PeriodoFechas; label: string }[] = [
  { id: 'todos', label: 'Todo el histórico' },
  { id: 'ultimos30', label: 'Últimos 30 días' },
  { id: 'esteMes', label: 'Este mes' },
  { id: 'mesAnterior', label: 'Mes anterior' },
  { id: 'esteAnio', label: 'Este año' },
  { id: 'personalizado', label: 'Personalizado' },
];

export function fechaInput(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Rango [desde, hasta] ('YYYY-MM-DD') del período elegido. Mismo criterio que
 * el select de "Período" de los dashboards del Resumen.
 */
export function rangoParaPeriodo(
  periodo: PeriodoFechas,
  fechaInicio: string,
  fechaFin: string,
): { desde?: string; hasta?: string } {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  switch (periodo) {
    case 'ultimos30': {
      const desde = new Date();
      desde.setDate(hoy.getDate() - 29);
      return { desde: fechaInput(desde), hasta: fechaInput(hoy) };
    }
    case 'esteMes':
      return {
        desde: `${anio}-${String(mes + 1).padStart(2, '0')}-01`,
        hasta: fechaInput(hoy),
      };
    case 'mesAnterior': {
      const primerDia = new Date(anio, mes - 1, 1);
      const ultimoDia = new Date(anio, mes, 0);
      return { desde: fechaInput(primerDia), hasta: fechaInput(ultimoDia) };
    }
    case 'esteAnio':
      return { desde: `${anio}-01-01`, hasta: fechaInput(hoy) };
    case 'personalizado':
      return { desde: fechaInicio || undefined, hasta: fechaFin || undefined };
    default:
      return {};
  }
}