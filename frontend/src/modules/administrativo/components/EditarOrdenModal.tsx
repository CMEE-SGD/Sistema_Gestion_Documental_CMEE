// Modal de edición directa de la cabecera de una orden de trabajo.
// Administrador: PATCH directo a /recepcion-equipos/:id (sin pasar por el
// flujo de estados).

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import type { OrdenTrabajoDetalle } from './VistaDetalleOrden';

interface Props {
  orden: OrdenTrabajoDetalle | null;
  onClose: () => void;
}

interface ClienteOption {
  id: number;
  nombre: string;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function EditarOrdenModal({ orden, onClose }: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();

  const { data: clientes } = useQuery<ClienteOption[]>({
    queryKey: ['clientes-institucionales', 'editar-orden'],
    queryFn: async () => {
      const res = await api.get('/clientes-institucionales');
      return res.data;
    },
    enabled: !!orden,
  });

  const [ordenTrabajoFisica, setOrdenTrabajoFisica] = useState('');
  const [nProforma, setNProforma] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');

  useEffect(() => {
    if (!orden) return;
    setOrdenTrabajoFisica(orden.orden_trabajo_fisica ?? '');
    setNProforma(orden.n_proforma ?? '');
    setClienteId(orden.cliente_id ? String(orden.cliente_id) : '');
    setFechaIngreso(toDateInput(orden.fecha_ingreso));
  }, [orden]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/recepcion-equipos/${orden!.id}`, {
        orden_trabajo_fisica: ordenTrabajoFisica.trim(),
        n_proforma: nProforma.trim() || undefined,
        cliente_id: Number(clienteId),
        fecha_ingreso: fechaIngreso || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Orden de trabajo actualizada correctamente.' });
      onClose();
    },
    onError: async (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      await alert({
        message:
          apiErr?.response?.data?.message ||
          'Error al actualizar la orden de trabajo',
      });
    },
  });

  if (!orden) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenTrabajoFisica.trim()) return;
    if (!clienteId) return;
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Editar Orden de Trabajo</h2>
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
              Edición directa de los datos de la orden (cabecera). Los cambios
              se guardan de inmediato en la base de datos.
            </p>

            <div>
              <label
                htmlFor="editar-orden-numero"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                N° Orden Física <span className="text-destructive">*</span>
              </label>
              <input
                id="editar-orden-numero"
                type="text"
                value={ordenTrabajoFisica}
                onChange={(e) => setOrdenTrabajoFisica(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-bold text-red-600 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="editar-orden-proforma"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                N° Proforma
              </label>
              <input
                id="editar-orden-proforma"
                type="text"
                value={nProforma}
                onChange={(e) => setNProforma(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="editar-orden-cliente"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Cliente / Unidad <span className="text-destructive">*</span>
              </label>
              <select
                id="editar-orden-cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seleccione un cliente…</option>
                {clientes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="editar-orden-fecha"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Fecha de Ingreso
              </label>
              <input
                id="editar-orden-fecha"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                !ordenTrabajoFisica.trim() ||
                !clienteId ||
                mutation.isPending
              }
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}