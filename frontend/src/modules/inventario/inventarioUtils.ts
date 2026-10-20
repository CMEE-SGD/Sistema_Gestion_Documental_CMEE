// Utilidades compartidas del módulo de inventario (insumos y materiales):
// etiquetas de enums, estilos de badge y formatos. Espejo mínimo de
// `financieroUtils` para no acoplar este módulo con el financiero.

export const UNIDAD_LABEL: Record<string, string> = {
  UNIDAD: 'Und.',
  CAJA: 'Caja',
  KIT: 'Kit',
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'mL',
  M: 'm',
};

export const UNIDAD_OPCIONES = Object.entries(UNIDAD_LABEL).map(([id, label]) => ({
  id,
  label,
}));

export const TIPO_MOVIMIENTO_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export const TIPO_MOVIMIENTO_STYLE: Record<string, string> = {
  ENTRADA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  SALIDA: 'bg-red-100 text-red-700 border-red-300',
  AJUSTE: 'bg-blue-100 text-blue-800 border-blue-300',
};

export const TIPO_MOVIMIENTO_OPCIONES = Object.entries(TIPO_MOVIMIENTO_LABEL).map(
  ([id, label]) => ({ id, label }),
);

export const MOTIVO_MOVIMIENTO_LABEL: Record<string, string> = {
  COMPRA: 'Compra',
  CONSUMO_LABORATORIO: 'Consumo de laboratorio',
  MERMA: 'Merma / vencimiento',
  DEVOLUCION: 'Devolución',
  AJUSTE_INVENTARIO: 'Ajuste por conteo',
  OTRO: 'Otro',
};

export const MOTIVO_MOVIMIENTO_OPCIONES = Object.entries(MOTIVO_MOVIMIENTO_LABEL).map(
  ([id, label]) => ({ id, label }),
);

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

export const fmtFechaHora = (s: string | null | undefined): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

/** Cantidad de insumos: hasta 3 decimales (gramos/mililitros). */
export const fmtCantidad = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return '0';
  return v.toLocaleString('es-BO', { maximumFractionDigits: 3 });
};

/**
 * ¿El stock está por debajo del mínimo? Solo aplica a productos con mínimo
 * configurado (> 0): mínimo 0 significa "sin control de mínimo" y no alerta.
 * Mismo criterio que el endpoint /inventario/alertas del backend.
 */
export const esBajoStock = (
  stockActual: number | string | null | undefined,
  stockMinimo: number | string | null | undefined,
): boolean => {
  const minimo = Number(stockMinimo);
  if (!Number.isFinite(minimo) || minimo <= 0) return false;
  return Number(stockActual) <= minimo;
};

export function badgeClass(tone: string): string {
  return `inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${tone}`;
}

/** Input de formulario con el estilo base de los módulos internos. */
export const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export const labelCls =
  'block text-xs font-medium text-slate-400 uppercase tracking-wide';

export const btnPrimarioCls =
  'inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none';

export const btnSecundarioCls =
  'inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50';

// ---------------------------------------------------------------------------
// Tipos compartidos (espejo de las respuestas del backend)
// ---------------------------------------------------------------------------

export interface CategoriaInsumo {
  id: number;
  nombre: string;
  activo?: boolean;
  _count?: { productos: number };
}

export interface ProductoInventario {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidad: string;
  categoria_id: number;
  categoria?: { id: number; nombre: string };
  stock_actual: string | number;
  stock_minimo: string | number;
  ubicacion: string | null;
  fecha_ultimo_mov: string | null;
  activo: boolean;
  createdAt?: string;
}

export interface MovimientoInventarioRow {
  id: number;
  producto_id: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  motivo: string;
  cantidad: string | number;
  stock_anterior: string | number;
  stock_posterior: string | number;
  descripcion: string | null;
  fecha: string;
  registrado_por: { nombre: string; apellidos: string } | null;
  producto?: { id: number; codigo: string; nombre: string; unidad: string };
}
