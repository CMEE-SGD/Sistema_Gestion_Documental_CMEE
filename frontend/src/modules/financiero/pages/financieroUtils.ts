// Utilidades compartidas del módulo financiero (proformas, facturas, cartera,
// próximas calibraciones) — formatos, badges y etiquetas consistentes.

export const fmtMoneda = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return 'Bs 0,00';
  return (
    'Bs ' +
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