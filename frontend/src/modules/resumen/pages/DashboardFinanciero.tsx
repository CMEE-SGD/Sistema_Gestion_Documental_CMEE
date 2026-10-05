// Resumen financiero — gráficas de Gestión Financiera en el módulo Resumen:
// ingresos (facturas) vs egresos, cartera por cobrar, estados y viáticos.
// Lee los mismos datos de los módulos financieros (facturacion + egresos) y
// los agrega en el navegador con recharts.

import { useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, X } from 'lucide-react';
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
import { useToast } from '../../../shared/components/molecules/Toast';
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

// --- Distribución de resultados (reparto 15% / 85% entre dos empresas) ---
type BaseDistribucion = 'neto' | 'cobrado' | 'facturado' | 'todos';

interface DistribucionConfig {
  habilitada: boolean;
  empresa_a: { nombre: string; porcentaje: number };
  empresa_b: { nombre: string; porcentaje: number };
  base: BaseDistribucion;
  nota: string | null;
}

interface DistribucionSerie {
  mes: string;
  total: number;
  empresa_a: number;
  empresa_b: number;
}

interface DistribucionResumen {
  config: DistribucionConfig;
  bases: {
    neto: { total: number; por_mes: DistribucionSerie[] };
    cobrado: { total: number; por_mes: DistribucionSerie[] };
    facturado: { total: number; por_mes: DistribucionSerie[] };
  };
}

const BASE_LABEL: Record<BaseDistribucion, string> = {
  neto: 'Resultado neto (facturas − egresos)',
  cobrado: 'Cobrado (pagos de facturas)',
  facturado: 'Facturado (total facturas)',
  todos: 'Todos los indicadores',
};

const BASE_COLOR: Record<BaseDistribucion, string> = {
  neto: '#7c3aed',
  cobrado: '#0891b2',
  facturado: '#db2777',
  todos: '#2563eb',
};

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

const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none';
const labelCls =
  'mb-1 block text-xs font-semibold text-slate-600';

function ModalDistribucion({
  config,
  onCerrar,
  onGuardado,
}: {
  config: DistribucionConfig;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [habilitada, setHabilitada] = useState(config.habilitada);
  const [nombreA, setNombreA] = useState(config.empresa_a.nombre);
  const [pctA, setPctA] = useState(String(config.empresa_a.porcentaje));
  const [nombreB, setNombreB] = useState(config.empresa_b.nombre);
  const [pctB, setPctB] = useState(String(config.empresa_b.porcentaje));
  const [base, setBase] = useState<BaseDistribucion>(config.base);
  const [nota, setNota] = useState(config.nota ?? '');
  const { toast } = useToast();

  const pctAN = Number(pctA) || 0;
  const pctBN = Number(pctB) || 0;
  const suma = Math.round((pctAN + pctBN) * 100) / 100;

  const guardar = useMutation({
    mutationFn: async () => {
      const res = await api.put('/facturacion/distribucion', {
        habilitada,
        empresa_a_nombre: nombreA.trim(),
        empresa_a_porcentaje: pctAN,
        empresa_b_nombre: nombreB.trim(),
        empresa_b_porcentaje: pctBN,
        base,
        nota: nota.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Distribución de resultados actualizada.' });
      onGuardado();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo guardar la configuración.',
      });
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Distribución de resultados
          </h3>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-xs text-slate-500">
          Las cuentas se llevan entre dos empresas. Defina nombres, porcentajes
          y sobre qué monto se reparte cada mes.
        </p>

        <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={habilitada}
            onChange={(e) => setHabilitada(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          Distribución habilitada (se muestra en el resumen)
        </label>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Empresa 1 — nombre</label>
            <input
              className={inputCls}
              value={nombreA}
              onChange={(e) => setNombreA(e.target.value)}
              placeholder="Empresa A"
            />
          </div>
          <div>
            <label className={labelCls}>Empresa 1 — %</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              className={inputCls}
              value={pctA}
              onChange={(e) => setPctA(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Empresa 2 — nombre</label>
            <input
              className={inputCls}
              value={nombreB}
              onChange={(e) => setNombreB(e.target.value)}
              placeholder="Empresa B"
            />
          </div>
          <div>
            <label className={labelCls}>Empresa 2 — %</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              className={inputCls}
              value={pctB}
              onChange={(e) => setPctB(e.target.value)}
            />
          </div>
        </div>

        {suma !== 100 && (
          <p className="mb-3 text-xs text-amber-600">
            Los porcentajes suman {suma}% (se recomienda 100%).
          </p>
        )}

        <div className="mb-3">
          <label className={labelCls}>¿Sobre qué monto se reparte?</label>
          <select
            className={inputCls}
            value={base}
            onChange={(e) => setBase(e.target.value as BaseDistribucion)}
          >
            <option value="neto">Resultado neto (facturas − egresos)</option>
            <option value="cobrado">Cobrado (pagos de facturas)</option>
            <option value="facturado">Facturado (total facturas)</option>
            <option value="todos">Todos los indicadores</option>
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Puede cambiarlo después: todavía no es necesario saber cuál es el
            correcto.
          </p>
        </div>

        <div className="mb-3">
          <label className={labelCls}>Nota (opcional)</label>
          <input
            className={inputCls}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="p. ej. acuerdo entre empresas"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCerrar}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => guardar.mutate()}
            disabled={guardar.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardar.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardFinanciero() {
  const queryClient = useQueryClient();
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
  const distribucionQ = useQuery<DistribucionResumen>({
    queryKey: ['resumen-financiero', 'distribucion'],
    queryFn: async () =>
      (await api.get('/facturacion/distribucion/resumen')).data,
  });
  const [editarDistribucion, setEditarDistribucion] = useState(false);

  const isLoading =
    facturasQ.isLoading ||
    proformasQ.isLoading ||
    carteraQ.isLoading ||
    egresosQ.isLoading ||
    distribucionQ.isLoading;

  const facturas = facturasQ.data ?? [];
  const proformas = proformasQ.data ?? [];
  const cartera = carteraQ.data;
  const egresos = egresosQ.data ?? [];
  const distribucion = distribucionQ.data ?? null;

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

  // Serie de la base elegida para la distribución (null si la base es 'todos').
  const serieBase = distribucion
    ? distribucion.config.base === 'todos'
      ? null
      : distribucion.bases[distribucion.config.base]
    : null;

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

      {/* Distribución de resultados entre empresas */}
      {distribucion && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-800">
                Distribución de resultados
              </h3>
              <p className="text-xs text-indigo-700/80">
                {BASE_LABEL[distribucion.config.base]} ·{' '}
                {distribucion.config.empresa_a.nombre || 'Empresa A'}{' '}
                {distribucion.config.empresa_a.porcentaje}% /{' '}
                {distribucion.config.empresa_b.nombre || 'Empresa B'}{' '}
                {distribucion.config.empresa_b.porcentaje}%
              </p>
            </div>
            <button
              onClick={() => setEditarDistribucion(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-white px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-100"
            >
              <Pencil className="h-3.5 w-3.5" />
              Configurar
            </button>
          </div>

          {!distribucion.config.habilitada ? (
            <p className="text-sm text-slate-600">
              La distribución está{' '}
              <span className="font-semibold">deshabilitada</span>. Actívela
              desde “Configurar” para ver cuánto corresponde a cada empresa.
            </p>
          ) : distribucion.config.base === 'todos' ? (
            <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-900">
                    <th className="px-3 py-2 text-left font-semibold">
                      Indicador
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Total
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      {distribucion.config.empresa_a.nombre || 'Empresa A'} (
                      {distribucion.config.empresa_a.porcentaje}%)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      {distribucion.config.empresa_b.nombre || 'Empresa B'} (
                      {distribucion.config.empresa_b.porcentaje}%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(['neto', 'cobrado', 'facturado'] as const).map((k) => (
                    <tr key={k} className="border-t border-slate-200">
                      <td className="px-3 py-2 text-slate-700">
                        {BASE_LABEL[k]}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-800">
                        {fmtMoneda(distribucion.bases[k].total)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-700">
                        {fmtMoneda(
                          (distribucion.bases[k].total *
                            distribucion.config.empresa_a.porcentaje) /
                            100,
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-amber-700">
                        {fmtMoneda(
                          (distribucion.bases[k].total *
                            distribucion.config.empresa_b.porcentaje) /
                            100,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  titulo="Total a repartir"
                  valor={fmtMoneda(serieBase?.total ?? 0)}
                  detalle={BASE_LABEL[distribucion.config.base]}
                  tonalidad="border-indigo-300 bg-white text-indigo-900"
                />
                <StatCard
                  titulo={distribucion.config.empresa_a.nombre || 'Empresa A'}
                  valor={fmtMoneda(
                    ((serieBase?.total ?? 0) *
                      distribucion.config.empresa_a.porcentaje) /
                      100,
                  )}
                  detalle={`${distribucion.config.empresa_a.porcentaje}% del total`}
                  tonalidad="border-blue-300 bg-blue-50 text-blue-900"
                />
                <StatCard
                  titulo={distribucion.config.empresa_b.nombre || 'Empresa B'}
                  valor={fmtMoneda(
                    ((serieBase?.total ?? 0) *
                      distribucion.config.empresa_b.porcentaje) /
                      100,
                  )}
                  detalle={`${distribucion.config.empresa_b.porcentaje}% del total`}
                  tonalidad="border-amber-300 bg-amber-50 text-amber-900"
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  Reparto por mes — {BASE_LABEL[distribucion.config.base]}
                </h4>
                {serieBase && serieBase.por_mes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin datos para este período.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={(serieBase?.por_mes ?? []).map((r) => ({
                        mes: labelMes(r.mes),
                        [distribucion.config.empresa_a.nombre || 'Empresa A']:
                          r.empresa_a,
                        [distribucion.config.empresa_b.nombre || 'Empresa B']:
                          r.empresa_b,
                      }))}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => fmtMoneda(Number(v))} />
                      <Legend />
                      <Bar
                        dataKey={
                          distribucion.config.empresa_a.nombre || 'Empresa A'
                        }
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey={
                          distribucion.config.empresa_b.nombre || 'Empresa B'
                        }
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}

          {distribucion.config.nota && (
            <p className="mt-3 text-xs text-indigo-700/70">
              Nota: {distribucion.config.nota}
            </p>
          )}
        </div>
      )}

      {editarDistribucion && distribucion && (
        <ModalDistribucion
          config={distribucion.config}
          onCerrar={() => setEditarDistribucion(false)}
          onGuardado={() => {
            setEditarDistribucion(false);
            void queryClient.invalidateQueries({
              queryKey: ['resumen-financiero', 'distribucion'],
            });
          }}
        />
      )}

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