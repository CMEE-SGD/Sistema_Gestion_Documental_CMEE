// Próximas calibraciones — Fase D: equipos cuya próxima calibración vence
// (vencida o en los próximos N días) + generación de notificaciones.

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, CalendarClock, Loader2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { badgeClass, fmtFecha } from './financieroUtils';

interface ProximaCalibracion {
  id: number;
  equipo_descripcion: string;
  codigo_cmee: string | null;
  fecha_proxima_calibracion: string;
  dias_restantes: number;
  estado_calibracion: 'VENCIDA' | 'PROXIMA';
  orden_trabajo: {
    id: number;
    orden_trabajo_fisica: string;
    cliente: { id: number; nombre: string } | null;
  } | null;
  laboratorio: { id: number; nombre: string } | null;
  tecnico: { id: number; nombre: string; apellidos: string } | null;
  certificados: { id: number; numero_certificado: number }[];
}

const HORIZONTES = [30, 60, 90];

export default function ProximasCalibracionesPage() {
  const [horizonte, setHorizonte] = useState(90);
  const { alert } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const puedeNotificar = tienePermiso('Gestion Financiera', 4);

  const { data = [], isLoading } = useQuery<ProximaCalibracion[]>({
    queryKey: ['proximas-calibraciones', horizonte],
    queryFn: async () => {
      const res = await api.get('/facturacion/proximas-calibraciones', {
        params: { horizonte },
      });
      return res.data;
    },
  });

  const notificar = useMutation({
    mutationFn: async () => {
      const res = await api.post('/facturacion/proximas-calibraciones/notificar');
      return res.data as { notificadas: number; total: number };
    },
    onSuccess: (r) => {
      toast({
        message: `Notificaciones generadas: ${r.notificadas} sobre ${r.total} alertas.`,
      });
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudieron generar las notificaciones.',
      });
    },
  });

  const vencidas = data.filter((e) => e.estado_calibracion === 'VENCIDA');
  const proximas = data.filter((e) => e.estado_calibracion === 'PROXIMA');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando alertas…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <CalendarClock className="h-5 w-5" /> Próximas calibraciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Equipos con calibración vencida o que vence en los próximos días.
            Las fechas se registran en la ficha del equipo (Fase A).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Horizonte:</label>
          <select
            value={horizonte}
            onChange={(e) => setHorizonte(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none"
          >
            {HORIZONTES.map((h) => (
              <option key={h} value={h}>
                {h} días
              </option>
            ))}
          </select>
          {puedeNotificar && (
            <button
              type="button"
              onClick={() => notificar.mutate()}
              disabled={notificar.isPending || data.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {notificar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              Notificar a servicio al cliente
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <TablaAlertas
          titulo={`Calibración VENCIDA (${vencidas.length})`}
          items={vencidas}
          tono="red"
        />
        <TablaAlertas
          titulo={`Próxima calibración (${proximas.length})`}
          items={proximas}
          tono="sky"
        />
      </div>
    </div>
  );
}

function TablaAlertas({
  titulo,
  items,
  tono,
}: {
  titulo: string;
  items: ProximaCalibracion[];
  tono: 'red' | 'sky';
}) {
  const tonoCls =
    tono === 'red'
      ? 'border-red-300 bg-red-50 text-red-900'
      : 'border-sky-300 bg-sky-50 text-sky-900';
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className={`border-b px-4 py-2.5 font-semibold ${tonoCls}`}>{titulo}</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-3 py-2 text-left font-semibold">Equipo</th>
              <th className="px-3 py-2 text-left font-semibold">Código CMEE</th>
              <th className="px-3 py-2 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2 text-left font-semibold">Orden</th>
              <th className="px-3 py-2 text-left font-semibold">Laboratorio</th>
              <th className="px-3 py-2 text-left font-semibold">Técnico</th>
              <th className="px-3 py-2 text-left font-semibold">
                Próx. calibración
              </th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-right font-semibold">Días</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-b border-slate-200 even:bg-slate-50">
                <td className="px-3 py-2 font-medium">{e.equipo_descripcion}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {e.codigo_cmee || '—'}
                </td>
                <td className="px-3 py-2">
                  {e.orden_trabajo?.cliente?.nombre || '—'}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {e.orden_trabajo ? `#${e.orden_trabajo.orden_trabajo_fisica}` : '—'}
                </td>
                <td className="px-3 py-2">{e.laboratorio?.nombre || '—'}</td>
                <td className="px-3 py-2">
                  {e.tecnico ? `${e.tecnico.nombre} ${e.tecnico.apellidos}` : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(e.fecha_proxima_calibracion)}
                </td>
                <td className="px-3 py-2">
                  {e.estado_calibracion === 'VENCIDA' ? (
                    <span className={badgeClass('border-red-300 bg-red-100 text-red-700')}>
                      Vencida
                    </span>
                  ) : (
                    <span className={badgeClass('border-sky-300 bg-sky-100 text-sky-800')}>
                      Próxima
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {e.dias_restantes < 0
                    ? `+${Math.abs(e.dias_restantes)}`
                    : `${e.dias_restantes}`}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-5 text-center text-muted-foreground">
                  Sin alertas en este grupo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}