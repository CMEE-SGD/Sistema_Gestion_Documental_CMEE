import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

// Fases del flujo de recepción de equipos (mismo enum que el backend:
// backend/prisma/schema.prisma → enum EstadoRecepcion).
const FASES: { valor: string; etiqueta: string }[] = [
  { valor: 'EN_ESPERA', etiqueta: 'En espera' },
  { valor: 'EN_CALIBRACION', etiqueta: 'En calibración' },
  { valor: 'REVISION_OBT', etiqueta: 'Revisión OBT' },
  { valor: 'PENDIENTE_FIRMA_TECNICO', etiqueta: 'Pendiente firma técnico' },
  { valor: 'REVISION_JEFE', etiqueta: 'Revisión jefe' },
  { valor: 'REVISION_DIRECTOR', etiqueta: 'Revisión director' },
  { valor: 'LISTO_PARA_ENTREGA', etiqueta: 'Listo para entrega' },
  { valor: 'FINALIZADO', etiqueta: 'Finalizado' },
];

function etiquetaDe(valor: string): string {
  return (
    FASES.find((f) => f.valor === valor)?.etiqueta ??
    valor.replace(/_/g, ' ').toLowerCase()
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recepcionId: number | null;
  equipoDescripcion: string;
  estadoActual: string;
  onSuccess: () => void;
}

export default function CambiarFaseModal({
  isOpen,
  onClose,
  recepcionId,
  equipoDescripcion,
  estadoActual,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const { alert, confirm } = useAlert();
  const { toast } = useToast();

  const [estadoNuevo, setEstadoNuevo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!recepcionId || !estadoNuevo) return;
      const res = await api.patch(
        `/recepcion-equipos/${recepcionId}/cambiar-fase`,
        {
          estado: estadoNuevo,
          observaciones: observaciones.trim() || undefined,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Fase cambiada correctamente.' });
      onSuccess();
      onClose();
      setEstadoNuevo('');
      setObservaciones('');
    },
    onError: async (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      await alert({
        message:
          apiErr?.response?.data?.message ||
          apiErr?.message ||
          'Error al cambiar la fase',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estadoNuevo || estadoNuevo === estadoActual) return;

    if (
      !(await confirm({
        title: 'Cambiar fase manualmente',
        message: `¿Pasar el equipo "${equipoDescripcion}" de "${etiquetaDe(
          estadoActual,
        )}" a "${etiquetaDe(estadoNuevo)}"? Esta acción queda registrada en el historial.`,
      }))
    ) {
      return;
    }

    mutation.mutate();
  };

  if (!isOpen || !recepcionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Cambiar fase manualmente</h2>
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
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <strong>Corrección de administrador:</strong> cambia la fase del
              equipo sin pasar por la máquina de estados. Úselo solo cuando
              otro usuario haya cometido un error. El movimiento queda trazado
              en el historial.
            </p>

            <p className="text-sm text-foreground">
              Equipo:{' '}
              <span className="font-medium">{equipoDescripcion}</span>
            </p>

            <p className="text-sm text-muted-foreground">
              Fase actual:{' '}
              <span className="font-medium text-foreground">
                {etiquetaDe(estadoActual)}
              </span>
            </p>

            <div>
              <label
                htmlFor="cambiar-fase-select"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Nueva fase <span className="text-destructive">*</span>
              </label>
              <select
                id="cambiar-fase-select"
                value={estadoNuevo}
                onChange={(e) => setEstadoNuevo(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seleccione una fase…</option>
                {FASES.filter((f) => f.valor !== estadoActual).map((f) => (
                  <option key={f.valor} value={f.valor}>
                    {f.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="observaciones-admin"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Observaciones{' '}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </label>
              <textarea
                id="observaciones-admin"
                rows={3}
                placeholder="Indique el motivo de la corrección (queda en el historial)…"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
              />
            </div>
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
              disabled={!estadoNuevo || mutation.isPending}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cambiando…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Cambiar fase
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}