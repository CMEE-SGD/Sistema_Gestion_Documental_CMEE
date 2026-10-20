// Movimientos — kardex global del inventario: todas las entradas, salidas y
// ajustes con su snapshot de stock anterior/posterior. Filtros por tipo,
// período y texto (nombre o código del producto).

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import api from '../../../core/api/axios';
import { esUsuarioAdministrador, tienePermiso } from '../../../shared/utils/auth';
import MovimientoFormModal from '../components/MovimientoFormModal';
import {
  MOTIVO_MOVIMIENTO_LABEL,
  MovimientoInventarioRow,
  TIPO_MOVIMIENTO_LABEL,
  TIPO_MOVIMIENTO_OPCIONES,
  TIPO_MOVIMIENTO_STYLE,
  UNIDAD_LABEL,
  badgeClass,
  btnPrimarioCls,
  fmtCantidad,
  fmtFechaHora,
  inputCls,
  labelCls,
} from '../inventarioUtils';

export default function MovimientosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [modalMovimiento, setModalMovimiento] = useState(false);

  const puedeEscribir = esUsuarioAdministrador() || tienePermiso('Inventario', 4);

  const params: Record<string, string> = {};
  if (tipoFiltro) params.tipo = tipoFiltro;
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const { data: movimientos = [], isLoading } = useQuery<MovimientoInventarioRow[]>({
    queryKey: ['inventario-movimientos', params],
    queryFn: async () => {
      const res = await api.get('/inventario/movimientos', { params });
      return res.data;
    },
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return movimientos;
    return movimientos.filter(
      (m) =>
        (m.producto?.nombre ?? '').toLowerCase().includes(q) ||
        (m.producto?.codigo ?? '').toLowerCase().includes(q) ||
        (m.descripcion ?? '').toLowerCase().includes(q),
    );
  }, [movimientos, busqueda]);

  const limpiarFiltros = () => {
    setTipoFiltro('');
    setDesde('');
    setHasta('');
    setBusqueda('');
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Movimientos de inventario</h1>
          <p className="text-sm text-muted-foreground">
            Kardex completo: cada entrada, salida y ajuste queda registrado con el stock
            anterior y posterior.
          </p>
        </div>
        {puedeEscribir && (
          <button
            type="button"
            onClick={() => setModalMovimiento(true)}
            className={btnPrimarioCls}
          >
            <Plus className="h-4 w-4" /> Registrar movimiento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar producto o referencia…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`${inputCls} pl-8`}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="mov-tipo">
            Tipo
          </label>
          <select
            id="mov-tipo"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="">Todos</option>
            {TIPO_MOVIMIENTO_OPCIONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="mov-desde">
            Desde
          </label>
          <input
            id="mov-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={`${inputCls} w-auto`}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="mov-hasta">
            Hasta
          </label>
          <input
            id="mov-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={`${inputCls} w-auto`}
          />
        </div>
        <button
          type="button"
          onClick={limpiarFiltros}
          className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
        >
          Limpiar
        </button>
        <span className="ml-auto text-xs text-slate-400">{filtrados.length} movimientos</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Producto</th>
              <th className="px-3 py-2 text-left font-semibold">Motivo</th>
              <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
              <th className="px-3 py-2 text-right font-semibold">Stock anterior</th>
              <th className="px-3 py-2 text-right font-semibold">Stock posterior</th>
              <th className="px-3 py-2 text-left font-semibold">Registró</th>
              <th className="px-3 py-2 text-left font-semibold">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && filtrados.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                  <ArrowLeftRight className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  No hay movimientos registrados con estos filtros.
                </td>
              </tr>
            )}
            {!isLoading &&
              filtrados.map((m) => {
                const unidad = UNIDAD_LABEL[m.producto?.unidad ?? 'UNIDAD'] ?? 'Und.';
                return (
                  <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {fmtFechaHora(m.fecha)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={badgeClass(TIPO_MOVIMIENTO_STYLE[m.tipo] ?? '')}>
                        {TIPO_MOVIMIENTO_LABEL[m.tipo] ?? m.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-800">
                        {m.producto?.nombre ?? '—'}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">{m.producto?.codigo}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {MOTIVO_MOVIMIENTO_LABEL[m.motivo] ?? m.motivo}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {m.tipo === 'SALIDA' ? '−' : m.tipo === 'ENTRADA' ? '+' : '±'}
                      {fmtCantidad(m.cantidad)}{' '}
                      <span className="text-xs font-normal text-slate-400">{unidad}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {fmtCantidad(m.stock_anterior)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-700">
                      {fmtCantidad(m.stock_posterior)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {m.registrado_por
                        ? `${m.registrado_por.nombre} ${m.registrado_por.apellidos}`
                        : '—'}
                    </td>
                    <td className="max-w-[28ch] truncate px-3 py-2 text-slate-500">
                      {m.descripcion || '—'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <MovimientoFormModal
        isOpen={modalMovimiento}
        onClose={() => setModalMovimiento(false)}
      />
    </div>
  );
}
