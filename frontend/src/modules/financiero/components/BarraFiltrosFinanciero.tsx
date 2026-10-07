// Barra de filtros compartida del módulo financiero: estado de la entidad
// (segmentos) + período de fechas (mismo criterio que el Resumen). La usan
// Órdenes de Trabajo, Proformas y Facturación.
import { X } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { OPCIONES_PERIODO, type PeriodoFechas } from '../pages/financieroUtils';

export interface FiltrosFinanciero {
  /** id de la opción de estado seleccionada ('todos' para mostrar todo). */
  estado: string;
  periodo: PeriodoFechas;
  fechaInicio: string;
  fechaFin: string;
}

export const FILTROS_INICIALES: FiltrosFinanciero = {
  estado: 'todos',
  periodo: 'todos',
  fechaInicio: '',
  fechaFin: '',
};

interface BarraFiltrosFinancieroProps {
  /** Etiqueta del grupo de segmentos, p. ej. 'Facturación' o 'Estado'. */
  labelEstado: string;
  opcionesEstado: Array<{ id: string; label: string }>;
  valores: FiltrosFinanciero;
  onChange: (v: FiltrosFinanciero) => void;
  /** Si hay búsqueda de texto activa, para mostrar el botón de limpiar. */
  busquedaActiva?: boolean;
  /** Acción extra al pulsar "Limpiar" (p. ej. borrar la búsqueda de texto). */
  onLimpiarAdicional?: () => void;
}

export function BarraFiltrosFinanciero({
  labelEstado,
  opcionesEstado,
  valores,
  onChange,
  busquedaActiva = false,
  onLimpiarAdicional,
}: BarraFiltrosFinancieroProps) {
  const hayFiltros =
    valores.estado !== 'todos' ||
    valores.periodo !== 'todos' ||
    valores.fechaInicio !== '' ||
    valores.fechaFin !== '' ||
    busquedaActiva;

  const limpiar = () => {
    onChange(FILTROS_INICIALES);
    onLimpiarAdicional?.();
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {labelEstado}
        </span>
        <div className="inline-flex items-center rounded-md border border-input bg-background p-0.5">
          {opcionesEstado.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => onChange({ ...valores, estado: op.id })}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                valores.estado === op.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Período</span>
        <select
          value={valores.periodo}
          onChange={(e) =>
            onChange({ ...valores, periodo: e.target.value as PeriodoFechas })
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
        >
          {OPCIONES_PERIODO.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {valores.periodo === 'personalizado' && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Desde
            </span>
            <input
              type="date"
              value={valores.fechaInicio}
              onChange={(e) =>
                onChange({ ...valores, fechaInicio: e.target.value })
              }
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Hasta
            </span>
            <input
              type="date"
              value={valores.fechaFin}
              onChange={(e) =>
                onChange({ ...valores, fechaFin: e.target.value })
              }
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
            />
          </div>
        </>
      )}

      {hayFiltros && (
        <button
          type="button"
          onClick={limpiar}
          className="inline-flex h-9 items-center gap-1.5 self-end rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}