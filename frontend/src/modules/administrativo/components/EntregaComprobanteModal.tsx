import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface ComprobanteActual {
  ruta?: string | null;
  nombre?: string | null;
  monto?: number | string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Equipo que se está entregando (id de la recepción). */
  recepcionId: number | null;
  /** Orden a la que pertenece el equipo (el comprobante es por orden). */
  ordenId: number | null;
  ordenFisica?: string;
  comprobanteActual?: ComprobanteActual | null;
  onSuccess: () => void;
}

const API_BASE = (import.meta as any).env.VITE_API_URL;

export default function EntregaComprobanteModal({
  isOpen,
  onClose,
  recepcionId,
  ordenId,
  ordenFisica,
  comprobanteActual,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();

  const [accion, setAccion] = useState<'APROBAR' | 'RECHAZAR' | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [monto, setMonto] = useState<string>(
    comprobanteActual?.monto != null ? String(comprobanteActual.monto) : '',
  );

  const tieneComprobante = !!comprobanteActual?.ruta;
  const montoValido = Number(monto) > 0;

  // El modal permanece montado (solo alterna isOpen), así que reiniciamos el
  // formulario cada vez que se abre para una orden/equipo distinto.
  useEffect(() => {
    if (isOpen) {
      setAccion(null);
      setObservaciones('');
      setFile(null);
      setMonto(
        comprobanteActual?.monto != null ? String(comprobanteActual.monto) : '',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recepcionId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!recepcionId || !accion) return;
      const token = localStorage.getItem('token');

      // 1) Si se entrega, primero se sube/actualiza el comprobante + monto.
      if (accion === 'APROBAR') {
        if (!file && !tieneComprobante) {
          throw { message: 'Adjunte la foto o PDF del comprobante de pago.' };
        }
        if (!montoValido) {
          throw { message: 'Ingrese un monto válido (mayor a 0).' };
        }
        const form = new FormData();
        if (file) form.append('comprobante', file);
        form.append('monto', monto);
        const upRes = await fetch(
          `${API_BASE}/recepcion-equipos/orden/${ordenId}/comprobante`,
          {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          },
        );
        if (!upRes.ok) {
          const err = await upRes.json().catch(() => null);
          throw err ?? { message: `Error HTTP ${upRes.status}` };
        }
      }

      // 2) Transición de estado del equipo.
      const res = await fetch(
        `${API_BASE}/recepcion-equipos/${recepcionId}/transicion-estado`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accion,
            observaciones: observaciones.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err ?? { message: `Error HTTP ${res.status}` };
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({
        message:
          accion === 'APROBAR'
            ? 'Entrega registrada. Se notificó a Financiero para facturar.'
            : 'Equipo devuelto a revisión.',
      });
      onSuccess();
      onClose();
    },
    onError: async (err: unknown) => {
      const apiErr = err as any;
      console.error('Error en entrega:', apiErr);
      await alert({
        message: apiErr?.message || 'Error al registrar la entrega',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accion) return;
    if (accion === 'RECHAZAR' && !observaciones.trim()) return;
    if (accion === 'APROBAR' && (!file && !tieneComprobante)) return;
    if (accion === 'APROBAR' && !montoValido) return;
    mutation.mutate();
  };

  if (!isOpen || !recepcionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            Entrega de la orden
            {ordenFisica ? (
              <span className="ml-1 text-muted-foreground">#{ordenFisica}</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              El receptor de la orden debe registrar el comprobante de pago
              (foto o PDF) y el monto antes de entregar. Esto habilita la
              facturación.
            </p>

            {/* Decisión */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Decisión
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccion('APROBAR')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'APROBAR'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50',
                  )}
                >
                  <CheckCircle className="h-5 w-5" />
                  Marcar Entregado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccion('RECHAZAR');
                    setObservaciones('');
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'RECHAZAR'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:border-red-300 hover:bg-red-50/50',
                  )}
                >
                  <XCircle className="h-5 w-5" />
                  Rechazar
                </button>
              </div>
            </div>

            {/* Comprobante + monto (solo al entregar) */}
            {accion === 'APROBAR' && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Comprobante (foto o PDF){' '}
                    {!tieneComprobante && (
                      <span className="text-destructive">*</span>
                    )}
                  </label>

                  {tieneComprobante && (
                    <div className="mb-2 flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <a
                        href={comprobanteActual?.ruta ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {comprobanteActual?.nombre || 'Ver comprobante actual'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary/50">
                    <Upload className="h-4 w-4" />
                    {file
                      ? file.name
                      : tieneComprobante
                        ? 'Reemplazar comprobante (opcional)'
                        : 'Seleccionar foto o PDF'}
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="monto-entrega"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Monto (USD) <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="monto-entrega"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                  />
                  {!montoValido && monto !== '' && (
                    <p className="mt-1 text-xs text-destructive">
                      Ingrese un monto mayor a 0.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Observaciones */}
            {accion === 'RECHAZAR' && (
              <div>
                <label
                  htmlFor="observaciones-entrega"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Observaciones <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="observaciones-entrega"
                  rows={4}
                  placeholder="Indique el motivo del rechazo..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                />
                {!observaciones.trim() && (
                  <p className="mt-1 text-xs text-destructive">
                    Las observaciones son obligatorias al rechazar
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                !accion ||
                mutation.isPending ||
                (accion === 'APROBAR' && (!file && !tieneComprobante)) ||
                (accion === 'APROBAR' && !montoValido)
              }
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50',
                accion === 'APROBAR'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : accion === 'RECHAZAR'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary',
              )}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : accion === 'APROBAR' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Marcar Entregado
                </>
              ) : accion === 'RECHAZAR' ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
