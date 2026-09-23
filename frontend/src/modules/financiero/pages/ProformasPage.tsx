// Proformas — entidad formal vinculable a las órdenes de trabajo
// (flujograma: "se vincula el código de la proforma").

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador } from '../../../shared/utils/auth';
import {
  ESTADO_PROFORMA_LABEL,
  fmtFecha,
  fmtMoneda,
  inputCls,
  labelCls,
} from './financieroUtils';

interface ClienteOption {
  id: number;
  nombre: string;
}

interface Proforma {
  id: number;
  numero: string;
  cliente_id: number;
  cliente: ClienteOption;
  fecha_emision: string;
  monto: number;
  estado: string;
  observaciones: string | null;
  ordenes_trabajo: { id: number; orden_trabajo_fisica: string }[];
}

export default function ProformasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();

  const { data: proformas = [], isLoading } = useQuery<Proforma[]>({
    queryKey: ['proformas'],
    queryFn: async () => {
      const res = await api.get('/facturacion/proformas');
      return res.data;
    },
  });

  const { data: clientes = [] } = useQuery<ClienteOption[]>({
    queryKey: ['clientes-opciones'],
    queryFn: async () => {
      const res = await api.get('/clientes-institucionales');
      return res.data;
    },
  });

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return proformas;
    return proformas.filter(
      (p) =>
        p.numero.toLowerCase().includes(q) ||
        p.cliente?.nombre.toLowerCase().includes(q) ||
        p.estado.toLowerCase().includes(q),
    );
  }, [proformas, busqueda]);

  const crearMutation = useMutation({
    mutationFn: async (payload: {
      cliente_id: number;
      fecha_emision: string;
      monto: number;
      numero?: string;
      observaciones?: string;
    }) => {
      const res = await api.post('/facturacion/proformas', payload);
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Proforma creada correctamente.' });
      setModalAbierto(false);
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo crear la proforma.',
      });
    },
  });

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const res = await api.patch(`/facturacion/proformas/${id}`, { estado });
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Estado de la proforma actualizado.' });
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo actualizar el estado de la proforma.',
      });
    },
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/facturacion/proformas/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({ message: 'Proforma eliminada.' });
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo eliminar la proforma.',
      });
    },
  });

  const handleEliminar = async (p: Proforma) => {
    const ok = await confirm({
      title: 'Eliminar proforma',
      message: `¿Eliminar la proforma ${p.numero}? Las órdenes que la referencian quedarán desvinculadas.`,
    });
    if (ok) eliminar.mutate(p.id);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando proformas…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Proformas</h1>
          <p className="text-sm text-muted-foreground">
            Cotizaciones previas del servicio, vinculables a las órdenes de
            trabajo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar proforma…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nueva proforma
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Número</th>
              <th className="px-3 py-2 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2 text-right font-semibold">Monto</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Órdenes vinculadas</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((p) => (
              <tr key={p.id} className="border-b border-slate-200 even:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs font-semibold">
                  {p.numero}
                </td>
                <td className="px-3 py-2">{p.cliente?.nombre || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(p.fecha_emision)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {fmtMoneda(p.monto)}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={p.estado}
                    onChange={(e) =>
                      cambiarEstado.mutate({ id: p.id, estado: e.target.value })
                    }
                    className="rounded border border-slate-300 bg-white px-1.5 py-1 text-xs font-medium focus:outline-none"
                  >
                    {Object.entries(ESTADO_PROFORMA_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  {p.ordenes_trabajo.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.ordenes_trabajo.map((o) => (
                        <span
                          key={o.id}
                          className="inline-block rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
                        >
                          OT #{o.orden_trabajo_fisica}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {esAdmin && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(p)}
                      title="Eliminar proforma"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Sin proformas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <ModalNuevaProforma
          clientes={clientes}
          onClose={() => setModalAbierto(false)}
          onSubmit={(payload) => crearMutation.mutate(payload)}
          guardando={crearMutation.isPending}
        />
      )}
    </div>
  );
}

const EmptyIcon = FileText;

function ModalNuevaProforma({
  clientes,
  onClose,
  onSubmit,
  guardando,
}: {
  clientes: ClienteOption[];
  onClose: () => void;
  onSubmit: (payload: {
    cliente_id: number;
    fecha_emision: string;
    monto: number;
    numero?: string;
    observaciones?: string;
  }) => void;
  guardando: boolean;
}) {
  const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const invalido =
    clienteId === '' || monto === '' || Number.isNaN(Number(monto));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10">
      <div className="w-[95vw] max-w-lg rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <EmptyIcon className="h-4 w-4" /> Nueva proforma
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className={labelCls}>Número (opcional)</label>
            <input
              className={inputCls}
              placeholder="Ej: PF-2026-0001 (si se deja vacío se genera automáticamente)"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Cliente *</label>
            <select
              className={inputCls}
              value={clienteId}
              onChange={(e) =>
                setClienteId(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">Seleccione un cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fecha de emisión</label>
              <input
                type="date"
                className={inputCls}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Monto (Bs) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                placeholder="0,00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              className={`${inputCls} min-h-[70px]`}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={invalido || guardando}
              onClick={() =>
                onSubmit({
                  numero: numero.trim() || undefined,
                  cliente_id: Number(clienteId),
                  fecha_emision: fecha,
                  monto: Number(monto),
                  observaciones: observaciones.trim() || undefined,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar proforma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}