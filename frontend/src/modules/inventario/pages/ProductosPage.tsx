// Productos — listado principal del inventario de insumos y materiales.
// Búsqueda, filtro por categoría, alerta de stock mínimo, alta/edición y
// accesos rápidos para registrar movimientos. La fila abre la ficha con el
// kardex completo del producto.

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Tags,
  TriangleAlert,
} from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador, tienePermiso } from '../../../shared/utils/auth';
import ProductoFormModal from '../components/ProductoFormModal';
import MovimientoFormModal from '../components/MovimientoFormModal';
import CategoriasModal from '../components/CategoriasModal';
import {
  CategoriaInsumo,
  ProductoInventario,
  UNIDAD_LABEL,
  btnPrimarioCls,
  btnSecundarioCls,
  esBajoStock,
  fmtCantidad,
  inputCls,
} from '../inventarioUtils';

type FiltroVista = 'activos' | 'todos';

export default function ProductosPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [vista, setVista] = useState<FiltroVista>('activos');

  const [modalProducto, setModalProducto] = useState(false);
  const [productoEdit, setProductoEdit] = useState<ProductoInventario | null>(null);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [productoMovimiento, setProductoMovimiento] = useState<ProductoInventario | null>(null);
  const [modalCategorias, setModalCategorias] = useState(false);

  const { alert, pedirMotivo } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const puedeEscribir = esUsuarioAdministrador() || tienePermiso('Inventario', 4);
  const puedeEliminar = esUsuarioAdministrador() || tienePermiso('Inventario', 5);

  const { data: productos = [], isLoading } = useQuery<ProductoInventario[]>({
    queryKey: ['inventario-productos', { vista }],
    queryFn: async () => {
      const res = await api.get('/inventario/productos', {
        params: vista === 'todos' ? { inactivos: 'true' } : {},
      });
      return res.data;
    },
  });

  const { data: categorias = [] } = useQuery<CategoriaInsumo[]>({
    queryKey: ['inventario-categorias'],
    queryFn: async () => {
      const res = await api.get('/inventario/categorias');
      return res.data;
    },
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (categoriaFiltro && String(p.categoria_id) !== categoriaFiltro) return false;
      if (soloBajoStock && !esBajoStock(p.stock_actual, p.stock_minimo)) return false;
      if (!q) return true;
      return (
        p.codigo.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion ?? '').toLowerCase().includes(q) ||
        (p.ubicacion ?? '').toLowerCase().includes(q) ||
        (p.categoria?.nombre ?? '').toLowerCase().includes(q)
      );
    });
  }, [productos, busqueda, categoriaFiltro, soloBajoStock]);

  const totalBajoStock = useMemo(
    () => productos.filter((p) => esBajoStock(p.stock_actual, p.stock_minimo)).length,
    [productos],
  );

  const bajaMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      await api.delete(`/inventario/productos/${id}`, { motivo });
      return id;
    },
    onSuccess: () => {
      toast({ message: 'Producto dado de baja (el kardex se conserva).' });
      void queryClient.invalidateQueries({ queryKey: ['inventario-productos'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-alertas'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo dar de baja el producto.',
      });
    },
  });

  const handleBaja = async (p: ProductoInventario) => {
    const motivo = await pedirMotivo({
      title: 'Dar de baja producto',
      message: `¿Dar de baja "${p.codigo}" — ${p.nombre}? Dejará de aparecer en los listados; su historial de movimientos se conserva.`,
      confirmLabel: 'Dar de baja',
    });
    if (!motivo) return;
    bajaMutation.mutate({ id: p.id, motivo });
  };

  const abrirMovimiento = (p: ProductoInventario) => {
    setProductoMovimiento(p);
    setModalMovimiento(true);
  };

  const abrirEdicion = (p: ProductoInventario) => {
    setProductoEdit(p);
    setModalProducto(true);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Inventario de productos</h1>
          <p className="text-sm text-muted-foreground">
            Insumos y materiales del centro: reactivos, gases, patrones y consumibles con
            control de stock por kardex.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalCategorias(true)}
            className={btnSecundarioCls}
          >
            <Tags className="h-4 w-4" /> Categorías
          </button>
          {puedeEscribir && (
            <button
              type="button"
              onClick={() => {
                setProductoEdit(null);
                setModalProducto(true);
              }}
              className={btnPrimarioCls}
            >
              <Plus className="h-4 w-4" /> Nuevo producto
            </button>
          )}
        </div>
      </div>

      {/* Vistas y alerta */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setVista('activos')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            vista === 'activos'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Activos
        </button>
        <button
          type="button"
          onClick={() => setVista('todos')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            vista === 'todos'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Histórico (todos)
        </button>
        <button
          type="button"
          onClick={() => setSoloBajoStock((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            soloBajoStock
              ? 'border-red-500 bg-red-500 text-white'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TriangleAlert className="h-3.5 w-3.5" />
          Bajo stock
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
              soloBajoStock ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {totalBajoStock}
          </span>
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {vista === 'activos' ? 'Productos activos' : 'Productos (histórico)'}
          </p>
          <p className="text-2xl font-bold">{productos.length}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Bajo stock mínimo
          </p>
          <p className={`text-2xl font-bold ${totalBajoStock > 0 ? 'text-red-600' : ''}`}>
            {totalBajoStock}
          </p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Categorías
          </p>
          <p className="text-2xl font-bold">{categorias.length}</p>
        </div>
      </div>

      {/* Búsqueda y filtro de categoría */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar por código, nombre, ubicación…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`${inputCls} pl-8`}
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">
          {filtrados.length} de {productos.length}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Código</th>
              <th className="px-3 py-2 text-left font-semibold">Producto</th>
              <th className="px-3 py-2 text-left font-semibold">Categoría</th>
              <th className="px-3 py-2 text-right font-semibold">Stock</th>
              <th className="px-3 py-2 text-right font-semibold">Mínimo</th>
              <th className="px-3 py-2 text-left font-semibold">Ubicación</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && filtrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  <Package className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  {productos.length === 0
                    ? 'Aún no hay productos en el inventario.'
                    : 'Ningún producto coincide con los filtros.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              filtrados.map((p) => {
                const bajo = esBajoStock(p.stock_actual, p.stock_minimo);
                const unidad = UNIDAD_LABEL[p.unidad] ?? p.unidad;
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/inventario/productos/${p.id}`)}
                    className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                      p.activo ? '' : 'bg-slate-50/60 text-slate-400'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{p.codigo}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">{p.nombre}</p>
                      {p.descripcion && (
                        <p className="truncate text-xs text-slate-400 max-w-[24ch]">
                          {p.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.categoria?.nombre ?? '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={bajo ? 'font-semibold text-red-600' : 'font-medium'}>
                        {fmtCantidad(p.stock_actual)}
                      </span>{' '}
                      <span className="text-xs text-slate-400">{unidad}</span>
                      {bajo && <TriangleAlert className="ml-1 inline h-3.5 w-3.5 text-red-500" />}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {Number(p.stock_minimo) > 0 ? fmtCantidad(p.stock_minimo) : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.ubicacion || '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${
                          p.activo
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                            : 'border-slate-300 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {p.activo && puedeEscribir && (
                          <button
                            type="button"
                            title="Registrar movimiento"
                            onClick={() => abrirMovimiento(p)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                        )}
                        {puedeEscribir && (
                          <button
                            type="button"
                            title="Editar producto"
                            onClick={() => abrirEdicion(p)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {p.activo && puedeEliminar && (
                          <button
                            type="button"
                            title="Dar de baja"
                            onClick={() => void handleBaja(p)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
                              <line x1="12" y1="2" x2="12" y2="12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <ProductoFormModal
        isOpen={modalProducto}
        onClose={() => setModalProducto(false)}
        producto={productoEdit}
      />
      <MovimientoFormModal
        isOpen={modalMovimiento}
        onClose={() => setModalMovimiento(false)}
        producto={productoMovimiento}
        productos={productos}
      />
      <CategoriasModal isOpen={modalCategorias} onClose={() => setModalCategorias(false)} />
    </div>
  );
}
