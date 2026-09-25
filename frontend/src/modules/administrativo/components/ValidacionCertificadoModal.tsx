import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recepcionId: number | null;
  estadoActual: string;
  tituloAccion: string;
  onSuccess: () => void;
}

const API_BASE = (import.meta as any).env.VITE_API_URL;

export default function ValidacionCertificadoModal({
  isOpen,
  onClose,
  recepcionId,
  estadoActual,
  tituloAccion,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();
  const [accion, setAccion] = useState<'APROBAR' | 'RECHAZAR' | null>(null);
  const [observaciones, setObservaciones] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!recepcionId || !accion) return;
      const token = localStorage.getItem('token');
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
      // Al aprobar la entrega final el equipo sale de la bandeja y pasa a la
      // pestaña "Archivadas": se avisa para que no parezca que se perdió.
      toast({
        message:
          estadoActual === 'LISTO_PARA_ENTREGA' && accion === 'APROBAR'
            ? 'Equipo entregado: pasó a la pestaña Archivadas.'
            : 'Certificado validado correctamente.',
      });
      onSuccess();
      onClose();
    },
    onError: async (err: unknown) => {
      const apiErr = err as any;
      console.error('Error en transición:', apiErr);
      await alert({ message: apiErr?.message || 'Error al procesar la transición' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accion) return;
    if (accion === 'RECHAZAR' && !observaciones.trim()) return;
    mutation.mutate();
  };

  if (!isOpen || !recepcionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{tituloAccion}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Estado actual: <span className="font-medium text-foreground">{estadoActual.replace(/_/g, ' ')}</span>
            </p>

            {/* Acción */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Decisión
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAccion('APROBAR');
                    setObservaciones('');
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'APROBAR'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50',
                  )}
                >
                  <CheckCircle className="h-5 w-5" />
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setAccion('RECHAZAR')}
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

            {/* Observaciones (requerido si RECHAZAR) */}
            {accion === 'RECHAZAR' && (
              <div>
                <label
                  htmlFor="observaciones"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Observaciones <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="observaciones"
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

            {accion === 'APROBAR' && (
              <div>
                <label
                  htmlFor="observaciones-aprobar"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Observaciones{' '}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="observaciones-aprobar"
                  rows={3}
                  placeholder="Comentario adicional..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                />
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
              disabled={!accion || mutation.isPending}
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
                  Aprobar
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
