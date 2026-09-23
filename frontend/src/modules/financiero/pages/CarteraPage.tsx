// Cartera — facturas con saldo pendiente: por vencer y vencidas (Fase C).

import { useQuery } from '@tanstack/react-query';
import { Loader2, Wallet } from 'lucide-react';
import api from '../../../core/api/axios';
import {
  badgeClass,
  fmtFecha,
  fmtMoneda,
} from './financieroUtils';

interface FacturaCartera {
  id: number;
  numero: string;
  cliente: { id: number; nombre: string };
  fecha_emision: string;
  fecha_vencimiento: string;
  total: number;
  pagado: number;
  saldo: number;
  estado: string;
}

interface CarteraResponse {
  vencida: (FacturaCartera & { dias_vencida: number })[];
  por_vencer: (FacturaCartera & { dias_restantes: number })[];
  total_vencida: number;
  total_por_vencer: number;
  conteo_vencida: number;
  conteo_por_vencer: number;
}

function StatCard({
  titulo,
  valor,
  tonalidad,
}: {
  titulo: string;
  valor: string;
  tonalidad: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${tonalidad}`}
    >
      <span className="block text-xs font-medium uppercase tracking-wide opacity-70">
        {titulo}
      </span>
      <span className="mt-1 block text-2xl font-bold">{valor}</span>
    </div>
  );
}

export default function CarteraPage() {
  const { data, isLoading } = useQuery<CarteraResponse>({
    queryKey: ['cartera'],
    queryFn: async () => {
      const res = await api.get('/facturacion/cartera');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando cartera…
      </div>
    );
  }

  const total = (data?.conteo_vencida ?? 0) + (data?.conteo_por_vencer ?? 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Wallet className="h-5 w-5" /> Cartera de cobro
        </h1>
        <p className="text-sm text-muted-foreground">
          Facturas pendientes de cobro: plazo de crédito (30 días por defecto,
          hasta 120), por vencer y vencidas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          titulo={`Por vencer (${data?.conteo_por_vencer ?? 0})`}
          valor={fmtMoneda(data?.total_por_vencer)}
          tonalidad="border-sky-200 bg-sky-50 text-sky-900"
        />
        <StatCard
          titulo={`Vencidas (${data?.conteo_vencida ?? 0})`}
          valor={fmtMoneda(data?.total_vencida)}
          tonalidad="border-red-200 bg-red-50 text-red-900"
        />
        <StatCard
          titulo={`Total pendiente (${total})`}
          valor={fmtMoneda(
            (data?.total_vencida ?? 0) + (data?.total_por_vencer ?? 0),
          )}
          tonalidad="border-slate-300 bg-white text-foreground"
        />
      </div>

      <div className="space-y-6">
        <TablaCartera
          titulo="Facturas por vencer"
          items={data?.por_vencer ?? []}
          resaltado="sky"
        />
        <TablaCartera
          titulo="Facturas vencidas"
          items={data?.vencida ?? []}
          resaltado="red"
        />
      </div>
    </div>
  );
}

interface ItemCartera extends FacturaCartera {
  dias_vencida?: number;
  dias_restantes?: number;
}

function TablaCartera({
  titulo,
  items,
  resaltado,
}: {
  titulo: string;
  items: ItemCartera[];
  resaltado: 'sky' | 'red';
}) {
  const resaltadoCls =
    resaltado === 'sky'
      ? 'border-sky-300 bg-sky-50 text-sky-900'
      : 'border-red-300 bg-red-50 text-red-900';
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className={`border-b px-4 py-2.5 font-semibold ${resaltadoCls}`}>
        {titulo} ({items.length})
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-3 py-2 text-left font-semibold">Factura</th>
              <th className="px-3 py-2 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2 text-left font-semibold">Emisión</th>
              <th className="px-3 py-2 text-left font-semibold">Vencimiento</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
              <th className="px-3 py-2 text-right font-semibold">Pagado</th>
              <th className="px-3 py-2 text-right font-semibold">Saldo</th>
              <th className="px-3 py-2 text-left font-semibold">Días</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id} className="border-b border-slate-200 even:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs font-semibold">
                  {f.numero}
                </td>
                <td className="px-3 py-2">{f.cliente?.nombre || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(f.fecha_emision)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(f.fecha_vencimiento)}
                </td>
                <td className="px-3 py-2 text-right">{fmtMoneda(f.total)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {fmtMoneda(f.pagado)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {fmtMoneda(f.saldo)}
                </td>
                <td className="px-3 py-2">
                  {f.dias_vencida ? (
                    <span className={badgeClass('border-red-300 bg-red-100 text-red-700')}>
                      {f.dias_vencida} día(s) vencida
                    </span>
                  ) : (
                    <span
                      className={badgeClass(
                        f.dias_restantes !== undefined && f.dias_restantes <= 15
                          ? 'border-amber-300 bg-amber-100 text-amber-800'
                          : 'border-slate-300 bg-slate-100 text-slate-700',
                      )}
                    >
                      {f.dias_restantes} día(s)
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-5 text-center text-muted-foreground">
                  Sin facturas en este grupo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}