// Resumen financiero — gráficas de Gestión Financiera en el módulo Resumen:
// ingresos (facturas) vs egresos, cartera por cobrar, estados y viáticos.
// Lee los mismos datos de los módulos financieros (facturacion + egresos) y
// los agrega en el navegador con recharts.

import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../core/api/axios';
import { ESTADO_FACTURA_LABEL, fmtFecha, fmtMoneda } from '../../financiero/pages/financieroUtils';

interface ClienteLigero {
  id: number;
  nombre: string;
}

interface FacturaResumen {
  id: number;
  numero: string;
  cliente: ClienteLigero;
  fecha_emision: string;
  fecha_vencimiento: string;
  total: number;
  pagado: number;
  saldo: number;
  estado: string;
  estado_cartera: string;
}

interface Proforma {
  id: number;
  numero: string;
  cliente: ClienteLigero;
  fecha_emision: string;
  monto: number;
  estado: string;
}

interface EgresoResumen {
  id: number;
  fecha: string;
  tipo_documento: string;
  numero_documento: string;
  proveedor: string;
  total: string;
  saldo: string;
  estado: string;
  es_viatico: boolean;
  cumple_viatico: boolean | null;
}

interface CarteraResponse {
  total_vencida: number;
  total_por_vencer: number;
  conteo_vencida: number;
  conteo_por_vencer: number;
}

const PALETA = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

const claveMes = (iso: string) => (iso ? iso.slice(0, 7) : '----');

const labelMes = (k: string) => {
  const d = new Date(
    Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, 1),
  );
  return d.toLocaleDateString('es-BO', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
};

function ChartCard({
  titulo,
  children,
  className = '',
}: {
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-300 bg-white p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{titulo}</h3>
      {children}
    </div>
  );
}

function StatCard({
  titulo,
  valor,
  detalle,
  tonalidad,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  tonalidad: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${tonalidad}`}>
      <span className="block text-xs font-medium uppercase tracking-wide opacity-70">
        {titulo}
      </span>
      <span className="mt-1 block text-2xl font-bold">{valor}</span>
      {detalle && (
        <span className="mt-0.5 block text-xs opacity-80">{detalle}</span>
      )}
    </div>
  );
}

export default function DashboardFinanciero() {
  const facturasQ = useQuery<FacturaResumen[]>({
    queryKey: ['resumen-financiero', 'facturas'],
    queryFn: async () => (await api.get('/facturacion/facturas')).data,
  });
  const proformasQ = useQuery<Proforma[]>({
    queryKey: ['resumen-financiero', 'proformas'],
    queryFn: async () => (await api.get('/facturacion/proformas')).data,
  });
  const carteraQ = useQuery<CarteraResponse>({
    queryKey: ['resumen-financiero', 'cartera'],
    queryFn: async () => (await api.get('/facturacion/cartera')).data,
  });
  const egresosQ = useQuery<EgresoResumen[]>({
    queryKey: ['resumen-financiero', 'egresos'],
    queryFn: async () => (await api.get('/egresos')).data,
  });

  const isLoading =
    facturasQ.isLoading ||
    proformasQ.isLoading ||
    carteraQ.isLoading ||
    egresosQ.isLoading;

  const facturas = facturasQ.data ?? [];
  const proformas = proformasQ.data ?? [];
  const cartera = carteraQ.data;
  const egresos = egresosQ.data ?? [];

  // --- Ingresos vs Egresos por mes ---
  const porMes = useMemo(() => {
    const map = new Map<string, { mes: string; Ingresos: number; Egresos: number }>();
    const add = (clave: string, campo: 'Ingresos' | 'Egresos', v: number) => {
      if (!map.has(clave)) map.set(clave, { mes: clave, Ingresos: 0, Egresos: 0 });
      map.get(clave)![campo] += v;
    };
    facturas.forEach((f) => add(claveMes(f.fecha_emision), 'Ingresos', Number(f.total) || 0));
    egresos.forEach((e) => add(claveMes(e.fecha), 'Egresos', Number(e.total) || 0));
    return [...map.values()]
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map((r) => ({ ...r, mes: labelMes(r.mes) }));
  }, [facturas, egresos]);

  // --- Egresos por tipo de documento ---
  const egresosPorTipo = useMemo(() => {
    const m = new Map<string, number>();
    egresos.forEach((e) => {
      m.set(e.tipo_documento, (m.get(e.tipo_documento) ?? 0) + (Number(e.total) || 0));
    });
    const items = [...m.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (items.length > 6) {
      const top = items.slice(0, 5);
      const resto = items.slice(5).reduce((a, i) => a + i.value, 0);
      return [...top, { name: 'Otros', value: resto }];
    }
    return items;
  }, [egresos]);

  // --- Facturas por estado ---
  const facturasPorEstado = useMemo(() => {
    const m = new Map<string, number>();
    facturas.forEach((f) => {
      const label = ESTADO_FACTURA_LABEL[f.estado] || f.estado;
      m.set(label, (m.get(label) ?? 0) + (Number(f.total) || 0));
    });
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [facturas]);

  // --- Viáticos ---
  const viaticos = useMemo(() => {
    const v = egresos.filter((e) => e.es_viatico);
    const cumple = v.filter((e) => e.cumple_viatico).length;
    return {
      cantidad: v.length,
      cumple,
      noCumple: v.length - cumple,
      data: [
        { name: 'Sí cumple', value: v.filter((e) => e.cumple_viatico).length },
        { name: 'No cumple', value: v.filter((e) => !e.cumple_viatico).length },
      ].filter((d) => d.value > 0),
    };
  }, [egresos]);

  // --- Top 5 proveedores de egresos ---
  const topProveedores = useMemo(() => {
    const m = new Map<string, number>();
    egresos.forEach((e) => {
      m.set(e.proveedor, (m.get(e.proveedor) ?? 0) + (Number(e.total) || 0));
    });
    return [...m.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [egresos]);

  // --- KPIs ---
  const kpis = useMemo(() => {
    const totalProformas = proformas.reduce((a, p) => a + (Number(p.monto) || 0), 0);
    const totalFacturas = facturas.reduce((a, f) => a + (Number(f.total) || 0), 0);
    const cobrado = facturas.reduce((a, f) => a + (Number(f.pagado) || 0), 0);
    const carteraTotal = facturas.reduce((a, f) => a + (Number(f.saldo) || 0), 0);
    const totalEgresos = egresos.reduce((a, e) => a + (Number(e.total) || 0), 0);
    const pendienteEgresos = egresos.reduce(
      (a, e) => (e.estado === 'Pendiente' ? a + (Number(e.saldo) || Number(e.total) || 0) : a),
      0,
    );
    return {
      totalProformas,
      countProformas: proformas.length,
      totalFacturas,
      countFacturas: facturas.length,
      cobrado,
      carteraTotal,
      totalEgresos,
      countEgresos: egresos.length,
      pendienteEgresos,
      neto: totalFacturas - totalEgresos,
    };
  }, [proformas, facturas, egresos]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 inline h-5 w-5 animate-spin" /> Cargando resumen
        financiero…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Resumen financiero</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores y gráficas de Gestión Financiera: proformas, facturas,
            cartera, egresos y viáticos.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Proformas"
          valor={fmtMoneda(kpis.totalProformas)}
          detalle={`${kpis.countProformas} proformas emitidas`}
          tonalidad="border-slate-300 bg-white text-slate-800"
        />
        <StatCard
          titulo="Facturas (ingresos)"
          valor={fmtMoneda(kpis.totalFacturas)}
          detalle={`${kpis.countFacturas} facturas · cobrado ${fmtMoneda(kpis.cobrado)}`}
          tonalidad="border-emerald-300 bg-emerald-50 text-emerald-900"
        />
        <StatCard
          titulo="Cartera por cobrar"
          valor={fmtMoneda(kpis.carteraTotal)}
          detalle={
            cartera
              ? `Vencida ${fmtMoneda(cartera.total_vencida)} · Por vencer ${fmtMoneda(cartera.total_por_vencer)}`
              : undefined
          }
          tonalidad="border-amber-300 bg-amber-50 text-amber-900"
        />
        <StatCard
          titulo="Egresos"
          valor={fmtMoneda(kpis.totalEgresos)}
          detalle={`${kpis.countEgresos} registros · pendiente ${fmtMoneda(kpis.pendienteEgresos)}`}
          tonalidad="border-rose-300 bg-rose-50 text-rose-900"
        />
      </div>

      {/* Resultado neto + viáticos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          titulo="Resultado neto (ingresos − egresos)"
          valor={fmtMoneda(kpis.neto)}
          detalle="Facturas emitidas menos egresos registrados"
          tonalidad={
            kpis.neto >= 0
              ? 'border-emerald-300 bg-white text-emerald-800'
              : 'border-red-300 bg-white text-red-700'
          }
        />
        <StatCard
          titulo="Viáticos"
          valor={String(viaticos.cantidad)}
          detalle={`${viaticos.cumple} cumplen · ${viaticos.noCumple} no cumplen`}
          tonalidad="border-violet-300 bg-violet-50 text-violet-900"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard titulo="Ingresos vs Egresos por mes (USD)" className="lg:col-span-2">
          {porMes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin datos para graficar.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porMes} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => fmtMoneda(Number(v))} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard titulo="Egresos por tipo de documento">
          {egresosPorTipo.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin egresos registrados.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={egresosPorTipo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(e) => e.name}
                >
                  {egresosPorTipo.map((_, i) => (
                    <Cell key={i} fill={PALETA[i % PALETA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtMoneda(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard titulo="Facturas por estado (USD)">
          {facturasPorEstado.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin facturas registradas.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={facturasPorEstado}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={100}
                >
                  {facturasPorEstado.map((_, i) => (
                    <Cell key={i} fill={PALETA[i % PALETA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtMoneda(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard titulo="Top 5 proveedores de egresos">
          {topProveedores.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin egresos registrados.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topProveedores}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => fmtMoneda(Number(v))} />
                <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard titulo="Viáticos · cumplimiento">
          {viaticos.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {viaticos.cantidad > 0
                ? 'Los viáticos aún no tienen registro de cumplimiento.'
                : 'No hay viáticos registrados.'}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={viaticos.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={100}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        Última actualización: {fmtFecha(new Date().toISOString())} — datos de
        Gestión Financiera.
      </p>
    </div>
  );
}