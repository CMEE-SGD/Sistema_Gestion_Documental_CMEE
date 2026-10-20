// Ficha del producto: datos del insumo, tarjetas de stock y su kardex
// completo (todos los movimientos, no solo los últimos 20 del include del
// detalle). Accesos directos para registrar movimientos y editar.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, Loader2, Package, Pencil, TriangleAlert } from 'lucide-react';
import api from '../../../core/api/axios';
import { esUsuarioAdministrador, tienePermiso } from '../../../shared/utils/auth';
import ProductoFormModal from '../components/ProductoFormModal';
import MovimientoFormModal from '../components/MovimientoFormModal';
import {
  MOTIVO_MOVIMIENTO_LABEL,
  MovimientoInventarioRow,
  TIPO_MOVIMIENTO_LABEL,
  TIPO_MOVIMIENTO_STYLE,
  UNIDAD_LABEL,
  badgeClass,
  btnPrimarioCls,
  btnSecundarioCls,
  esBajoStock,
  fmtCantidad,
  fmtFecha,
  fmtFechaHora,
} from '../inventarioUtils';

interface ProductoDetalle {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidad: string;
  categoria_id: number;
  categoria: { id: number; nombre: string };
  stock_actual: string | number;
  stock_minimo: string | number;
  ubicacion: string | null;
  fecha_ultimo_mov: string | null;
  activo: boolean;
  createdAt: string;
}

export default function DetalleProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalEdicion, setModalEdicion] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(false);

  const puedeEscribir = esUsuarioAdministrador() || tienePermiso('Inventario', 4);
  const productoId = Number(id);

  const { data: producto, isLoading, isError } = useQuery<ProductoDetalle>({
    queryKey: ['inventario-producto', productoId],
    queryFn: async () => {
      const res = await api.get(`/inventario/productos/${productoId}`);
      return res.data;
    },
    enabled: Number.isFinite(productoId),
  });

  // Kardex completo del producto (el detalle solo incluye los últimos 20).
  const { data: movimientos = [], isLoading: cargandoMov } = useQuery<
    MovimientoInventarioRow[]
  >({
    queryKey: ['inventario-movimientos', { producto_id: productoId }],
    queryFn: async () => {
      const res = await api.get('/inventario/movimientos', {
        params: { producto_id: productoId },
      });
      return res.data;
    },
    enabled: Number.isFinite(productoId),
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError || !producto) {
    return (
      <div className="py-16 text-center">
        <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">Producto no encontrado.</p>
        <button
          type="button"
          onClick={() => navigate('/inventario/productos')}
          className={`${btnSecundarioCls} mt-4`}
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inventario
        </button>
      </div>
    );
  }

  const unidad = UNIDAD_LABEL[producto.unidad] ?? producto.unidad;
  const bajo = esBajoStock(producto.stock_actual, producto.stock_minimo);

  return (
    <div className="space-y-4">
      {/* Volver + acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/inventario/productos')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Inventario
        </button>
        {puedeEscribir && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setModalEdicion(true)}
              className={btnSecundarioCls}
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>
            {producto.activo && (
              <button
                type="button"
                onClick={() => setModalMovimiento(true)}
                className={btnPrimarioCls}
              >
                <ArrowLeftRight className="h-4 w-4" /> Registrar movimiento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cabecera de la ficha */}
      <div className="rounded-lg border border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-400">{producto.codigo}</span>
              <span className="inline-block rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                {producto.categoria?.nombre ?? 'Sin categoría'}
              </span>
              <span
                className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${
                  producto.activo
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                    : 'border-slate-300 bg-slate-100 text-slate-500'
                }`}
              >
                {producto.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold">{producto.nombre}</h1>
            {producto.descripcion && (
              <p className="mt-1 text-sm text-slate-500">{producto.descripcion}</p>
            )}
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Ubicación: {producto.ubicacion || '—'}</p>
            <p>Unidad: {unidad}</p>
            <p>Registrado: {fmtFecha(producto.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de stock */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Stock actual
          </p>
          <p className={`text-2xl font-bold ${bajo ? 'text-red-600' : ''}`}>
            {fmtCantidad(producto.stock_actual)}{' '}
            <span className="text-sm font-medium text-slate-400">{unidad}</span>
          </p>
          {bajo && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
              <TriangleAlert className="h-3.5 w-3.5" /> Por debajo del mínimo
            </p>
          )}
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Stock mínimo
          </p>
          <p className="text-2xl font-bold text-slate-700">
            {Number(producto.stock_minimo) > 0 ? (
              <>
                {fmtCantidad(producto.stock_minimo)}{' '}
                <span className="text-sm font-medium text-slate-400">{unidad}</span>
              </>
            ) : (
              <span className="text-base font-medium text-slate-400">Sin control de mínimo</span>
            )}
          </p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Último movimiento
          </p>
          <p className="text-2xl font-bold text-slate-700">
            {producto.fecha_ultimo_mov ? fmtFecha(producto.fecha_ultimo_mov) : '—'}
          </p>
        </div>
      </div>

      {/* Kardex */}
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <div className="border-b border-slate-200 px-3 py-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Kardex ({movimientos.length} movimientos)
          </h2>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Motivo</th>
              <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
              <th className="px-3 py-2 text-right font-semibold">Anterior</th>
              <th className="px-3 py-2 text-right font-semibold">Posterior</th>
              <th className="px-3 py-2 text-left font-semibold">Registró</th>
              <th className="px-3 py-2 text-left font-semibold">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {cargandoMov && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!cargandoMov && movimientos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  Sin movimientos aún. El primer ingreso quedará registrado aquí.
                </td>
              </tr>
            )}
            {!cargandoMov &&
              movimientos.map((m) => (
                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {fmtFechaHora(m.fecha)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={badgeClass(TIPO_MOVIMIENTO_STYLE[m.tipo] ?? '')}>
                      {TIPO_MOVIMIENTO_LABEL[m.tipo] ?? m.tipo}
                    </span>
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
              ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <ProductoFormModal
        isOpen={modalEdicion}
        onClose={() => setModalEdicion(false)}
        producto={producto}
      />
      <MovimientoFormModal
        isOpen={modalMovimiento}
        onClose={() => setModalMovimiento(false)}
        producto={producto}
      />
    </div>
  );
}
