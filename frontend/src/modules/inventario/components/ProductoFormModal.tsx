import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import {
  CategoriaInsumo,
  ProductoInventario,
  UNIDAD_OPCIONES,
  btnPrimarioCls,
  btnSecundarioCls,
  inputCls,
  labelCls,
} from '../inventarioUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa, el modal edita ese producto; si no, crea uno nuevo. */
  producto?: ProductoInventario | null;
}

/**
 * Alta/edición de productos del inventario. El stock no se edita aquí: en
 * alta, `stock_inicial` genera automáticamente la primera ENTRADA del
 * kardex; en edición, el stock solo cambia mediante movimientos.
 */
export default function ProductoFormModal({ isOpen, onClose, producto }: Props) {
  const queryClient = useQueryClient();
  const { alert, pedirMotivo } = useAlert();
  const { toast } = useToast();
  const esEdicion = !!producto;

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [unidad, setUnidad] = useState('UNIDAD');
  const [stockInicial, setStockInicial] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [ubicacion, setUbicacion] = useState('');
  const [activo, setActivo] = useState(true);

  // Sincronizar el formulario cada vez que se abre (alta o edición).
  useEffect(() => {
    if (!isOpen) return;
    setCodigo(producto?.codigo ?? '');
    setNombre(producto?.nombre ?? '');
    setDescripcion(producto?.descripcion ?? '');
    setCategoriaId(producto ? String(producto.categoria_id) : '');
    setUnidad(producto?.unidad ?? 'UNIDAD');
    setStockInicial('0');
    setStockMinimo(String(Number(producto?.stock_minimo ?? 0)));
    setUbicacion(producto?.ubicacion ?? '');
    setActivo(producto?.activo ?? true);
  }, [isOpen, producto]);

  const { data: categorias = [], isLoading: cargandoCategorias } = useQuery<CategoriaInsumo[]>({
    queryKey: ['inventario-categorias'],
    queryFn: async () => {
      const res = await api.get('/inventario/categorias');
      return res.data;
    },
    enabled: isOpen,
  });

  const guardarMutation = useMutation({
    mutationFn: async ({
      payload,
      motivo,
    }: {
      payload: Record<string, unknown>;
      motivo?: string;
    }) => {
      if (esEdicion) {
        await api.patch(`/inventario/productos/${producto!.id}`, payload, { motivo });
      } else {
        await api.post('/inventario/productos', payload);
      }
    },
    onSuccess: () => {
      toast({
        message: esEdicion ? 'Producto actualizado.' : 'Producto registrado en el inventario.',
      });
      void queryClient.invalidateQueries({ queryKey: ['inventario-productos'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-producto'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-movimientos'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-alertas'] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo guardar el producto.',
      });
    },
  });

  const validado = codigo.trim() !== '' && nombre.trim() !== '' && categoriaId !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validado || guardarMutation.isPending) return;

    // Toda edición (PATCH) exige motivo: lo pide el interceptor de auditoría
    // y queda en la bitácora, igual que en el resto de los módulos.
    let motivo: string | null = null;
    if (esEdicion) {
      motivo = await pedirMotivo({
        title: 'Guardar cambios',
        message: `Va a modificar el producto "${producto?.codigo}" — ${producto?.nombre}.`,
        confirmLabel: 'Guardar',
      });
      if (!motivo) return;
    }

    const payload: Record<string, unknown> = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      unidad,
      categoria_id: Number(categoriaId),
      stock_minimo: Number(stockMinimo || 0),
      ubicacion: ubicacion.trim(),
    };
    if (esEdicion) {
      payload.activo = activo;
    } else {
      payload.stock_inicial = Math.max(0, Number(stockInicial || 0));
    }
    guardarMutation.mutate({ payload, motivo: motivo ?? undefined });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? `Editar producto — ${producto?.codigo}` : 'Nuevo producto / insumo'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="prod-codigo">
              Código *
            </label>
            <input
              id="prod-codigo"
              className={inputCls}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="INS-001"
              maxLength={30}
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="prod-nombre">
              Nombre *
            </label>
            <input
              id="prod-nombre"
              className={inputCls}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Reactivos, gases, patrones…"
              maxLength={200}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="prod-categoria">
              Categoría *
            </label>
            <select
              id="prod-categoria"
              className={inputCls}
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={cargandoCategorias}
            >
              <option value="">
                {cargandoCategorias ? 'Cargando…' : 'Seleccione…'}
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="prod-unidad">
              Unidad de medida
            </label>
            <select
              id="prod-unidad"
              className={inputCls}
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
            >
              {UNIDAD_OPCIONES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          {!esEdicion && (
            <div>
              <label className={labelCls} htmlFor="prod-stock-inicial">
                Stock inicial
              </label>
              <input
                id="prod-stock-inicial"
                type="number"
                min={0}
                step="any"
                className={inputCls}
                value={stockInicial}
                onChange={(e) => setStockInicial(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Se registra como la primera entrada en el kardex.
              </p>
            </div>
          )}
          <div>
            <label className={labelCls} htmlFor="prod-stock-minimo">
              Stock mínimo (alerta)
            </label>
            <input
              id="prod-stock-minimo"
              type="number"
              min={0}
              step="any"
              className={inputCls}
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              0 = sin control de mínimo (no genera alertas).
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="prod-ubicacion">
              Ubicación (estante / almacén)
            </label>
            <input
              id="prod-ubicacion"
              className={inputCls}
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Almacén central, Estante 3…"
              maxLength={150}
            />
          </div>
          {esEdicion && (
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Producto activo
              </label>
            </div>
          )}
        </div>

        <div>
          <label className={labelCls} htmlFor="prod-descripcion">
            Descripción
          </label>
          <textarea
            id="prod-descripcion"
            className={inputCls}
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Presentación, proveedor habitual, observaciones…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnSecundarioCls}>
            Cancelar
          </button>
          <button type="submit" disabled={!validado || guardarMutation.isPending} className={btnPrimarioCls}>
            {guardarMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {esEdicion ? 'Guardar cambios' : 'Registrar producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
