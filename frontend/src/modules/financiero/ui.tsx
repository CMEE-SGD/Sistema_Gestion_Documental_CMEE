import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../shared/utils/utils';
import type { EstadoEgreso, EstadoFactura, TipoCobro } from './tipos';

// ---------------------------------------------------------------------------
// Estilos de formulario
// ---------------------------------------------------------------------------

export const inputCls =
  'w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-[#8fa0b8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20';

export const labelCls = 'mb-1.5 block text-[13px] font-medium text-foreground';

// Cifras siempre alineadas a la derecha y con dígitos de ancho fijo.
export const cifraCls = 'text-right fin-cifra';

// ---------------------------------------------------------------------------
// Tonos semánticos (cada uno cumple contraste AA sobre su fondo)
// ---------------------------------------------------------------------------

export type Tono = 'ok' | 'aviso' | 'error' | 'info' | 'neutro';

const TONO: Record<Tono, { chip: string; punto: string; caja: string }> = {
  ok: {
    chip: 'bg-[var(--fin-ok-bg)] text-[var(--fin-ok-fg)]',
    punto: 'bg-[var(--fin-ok-punto)]',
    caja: 'border-[var(--fin-ok-linea)] bg-[var(--fin-ok-bg)] text-[var(--fin-ok-fg)]',
  },
  aviso: {
    chip: 'bg-[var(--fin-aviso-bg)] text-[var(--fin-aviso-fg)]',
    punto: 'bg-[var(--fin-aviso-punto)]',
    caja: 'border-[var(--fin-aviso-linea)] bg-[var(--fin-aviso-bg)] text-[var(--fin-aviso-fg)]',
  },
  error: {
    chip: 'bg-[var(--fin-error-bg)] text-[var(--fin-error-fg)]',
    punto: 'bg-[var(--fin-error-punto)]',
    caja: 'border-[var(--fin-error-linea)] bg-[var(--fin-error-bg)] text-[var(--fin-error-fg)]',
  },
  info: {
    chip: 'bg-[var(--fin-info-bg)] text-[var(--fin-info-fg)]',
    punto: 'bg-[var(--fin-info-punto)]',
    caja: 'border-[var(--fin-info-linea)] bg-[var(--fin-info-bg)] text-[var(--fin-info-fg)]',
  },
  neutro: {
    chip: 'bg-[var(--fin-neutro-bg)] text-[var(--fin-neutro-fg)]',
    punto: 'bg-[var(--fin-neutro-punto)]',
    caja: 'border-[var(--fin-neutro-linea)] bg-[var(--fin-neutro-bg)] text-[var(--fin-neutro-fg)]',
  },
};

export const colorTexto: Record<Tono, string> = {
  ok: 'text-[var(--fin-ok-fg)]',
  aviso: 'text-[var(--fin-aviso-fg)]',
  error: 'text-[var(--fin-error-fg)]',
  info: 'text-[var(--fin-info-fg)]',
  neutro: 'text-[var(--fin-neutro-fg)]',
};

const CHIP =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold';

function Chip({ tono, children }: { tono: Tono; children: ReactNode }) {
  return (
    <span className={cn(CHIP, TONO[tono].chip)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', TONO[tono].punto)} aria-hidden />
      {children}
    </span>
  );
}

const ESTADOS_FACTURA: Record<EstadoFactura, { etiqueta: string; tono: Tono }> = {
  PENDIENTE: { etiqueta: 'Pendiente', tono: 'info' },
  PARCIAL: { etiqueta: 'Pago parcial', tono: 'aviso' },
  COBRADA: { etiqueta: 'Cobrada', tono: 'ok' },
  VENCIDA: { etiqueta: 'Vencida', tono: 'error' },
  ANULADA: { etiqueta: 'Anulada', tono: 'neutro' },
};

export const tonoDeEstado = (estado: EstadoFactura): Tono => ESTADOS_FACTURA[estado].tono;

export function ChipEstadoFactura({ estado }: { estado: EstadoFactura }) {
  const e = ESTADOS_FACTURA[estado];
  return <Chip tono={e.tono}>{e.etiqueta}</Chip>;
}

export function ChipEstadoEgreso({ estado }: { estado: EstadoEgreso }) {
  return estado === 'PAGADO' ? <Chip tono="ok">Pagado</Chip> : <Chip tono="aviso">Pendiente</Chip>;
}

export const ETIQUETA_COBRO: Record<TipoCobro, string> = {
  PAGO: 'Pago',
  RETENCION: 'Retención',
  ENTREGA_EQUIPOS: 'Entrega de equipos',
};

// ---------------------------------------------------------------------------
// Aviso en línea
// ---------------------------------------------------------------------------

export function Aviso({
  tono,
  icono,
  children,
  accion,
  className,
}: {
  tono: Tono;
  icono?: ReactNode;
  children: ReactNode;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm leading-5',
        TONO[tono].caja,
        className,
      )}
    >
      <span className="flex items-start gap-2.5">
        {icono && <span className="mt-0.5 shrink-0">{icono}</span>}
        <span>{children}</span>
      </span>
      {accion}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Botón
// ---------------------------------------------------------------------------

const VARIANTES = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:bg-[#16304f]',
  outline: 'border border-input bg-card text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-white shadow-sm hover:bg-[#8a1c14]',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
};

const TAMANOS = {
  default: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-[13px]',
};

export function Boton({
  variant = 'default',
  size = 'default',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTES;
  size?: keyof typeof TAMANOS;
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-50',
        VARIANTES[variant],
        TAMANOS[size],
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Encabezado de página y superficies
// ---------------------------------------------------------------------------

export function EncabezadoPagina({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="fin-display text-[2.25rem] font-bold leading-[1.05] text-foreground">
          {titulo}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{descripcion}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  titulo,
  descripcion,
  accion,
  children,
  className,
  sinRelleno,
}: {
  titulo?: string;
  descripcion?: string;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
  sinRelleno?: boolean;
}) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(14,26,43,0.05)]',
        className,
      )}
    >
      {titulo && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="text-[15px] font-semibold leading-5 text-foreground">{titulo}</h2>
            {descripcion && (
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{descripcion}</p>
            )}
          </div>
          {accion}
        </header>
      )}
      <div className={sinRelleno ? '' : titulo ? 'px-5 pb-5 pt-4' : 'p-5'}>{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Ventanas: modal centrado y panel lateral
// ---------------------------------------------------------------------------

// Con `prioritario`, Escape cierra solo la ventana de más arriba (un modal
// abierto sobre el panel lateral no debe cerrar también el panel).
function useCerrarConEscape(activo: boolean, onCerrar: () => void, prioritario = false) {
  useEffect(() => {
    if (!activo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (prioritario) e.stopPropagation();
      onCerrar();
    };
    window.addEventListener('keydown', alTeclear, prioritario);
    return () => window.removeEventListener('keydown', alTeclear, prioritario);
  }, [activo, onCerrar, prioritario]);
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  ancho = 'max-w-2xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  ancho?: string;
}) {
  useCerrarConEscape(isOpen, onClose, true);

  useEffect(() => {
    if (!isOpen) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1a2b]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_60px_-12px_rgba(14,26,43,0.45)]',
          ancho,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <h2 className="fin-display text-[1.65rem] font-bold leading-none text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Panel deslizante desde la derecha, para ver el detalle sin perder la lista.
export function PanelLateral({
  abierto,
  onCerrar,
  titulo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useCerrarConEscape(abierto, onCerrar);

  useEffect(() => {
    if (abierto) panelRef.current?.focus();
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#0e1a2b]/50 backdrop-blur-[1px]" onClick={onCerrar} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-card shadow-[-24px_0_60px_-20px_rgba(14,26,43,0.4)] outline-none"
      >
        <div className="flex items-center justify-between border-b border-border bg-muted px-6 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
