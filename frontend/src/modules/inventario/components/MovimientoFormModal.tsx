import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import {
  MOTIVO_MOVIMIENTO_OPCIONES,
  ProductoInventario,
  TIPO_MOVIMIENTO_OPCIONES,
  UNIDAD_LABEL,
  btnPrimarioCls,
  btnSecundarioCls,
  fmtCantidad,
  inputCls,
  labelCls,
} from '../inventarioUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Producto fijo (viene de la ficha o de una fila). Si no, se elige en el modal. */
  producto?: ProductoInventario | null;
  /** Lista de productos para el selector; si no se pasa, se consulta al backend. */
  productos?: ProductoInventario[];
}

const AYUDA_TIPO: Record<string, string> = {
  ENTRADA: 'Suma al stock (compra, devolución, ingreso).',
  SALIDA: 'Resta al stock y exige stock suficiente (consumo, merma).',
  AJUSTE: 'Reemplaza el stock por el resultado del conteo físico.',
};

/**
 * Registrar movimiento de kardex: entrada, salida o ajuste por conteo.
 * Muestra el stock actual y el resultante proyectado antes de confirmar.
 */
export default function MovimientoFormModal({ isOpen, onClose, producto, productos }: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();

  const [productoId, setProductoId] = useState('');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
  const [motivo, setMotivo] = useState('CONSUMO_LABORATORIO');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setProductoId(producto ? String(producto.id) : '');
    setTipo('ENTRADA');
    setMotivo('CONSUMO_LABORATORIO');
    setCantidad('');
    setDescripcion('');
  }, [isOpen, producto]);

  // Si el caller no pasó la lista (p. ej. la ficha del producto), se trae aquí.
  const { data: productosFetched = [] } = useQuery<ProductoInventario[]>({
    queryKey: ['inventario-productos'],
    queryFn: async () => {
      const res = await api.get('/inventario/productos');
      return res.data;
    },
    enabled: isOpen && !producto && !productos,
  });

  const lista = producto ? [producto] : (productos ?? productosFetched);
  const seleccionado = lista.find((p) => String(p.id) === productoId) ?? null;

  const stockActual = Number(seleccionado?.stock_actual ?? 0);
  const cantidadNum = Number(cantidad);
  const cantidadValida = Number.isFinite(cantidadNum) && cantidadNum >= 0 &&
    (tipo === 'AJUSTE' ? true : cantidadNum > 0);

  let resultante: number | null = null;
  if (seleccionado && cantidadValida) {
    if (tipo === 'ENTRADA') resultante = stockActual + cantidadNum;
    else if (tipo === 'SALIDA') resultante = stockActual - cantidadNum;
    else resultante = cantidadNum;
  }
  const excedeSalida = tipo === 'SALIDA' && resultante !== null && resultante < 0;

  const registrarMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post('/inventario/movimientos', payload);
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Movimiento registrado en el kardex.' });
      void queryClient.invalidateQueries({ queryKey: ['inventario-productos'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-producto'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-movimientos'] });
      void queryClient.invalidateQueries({ queryKey: ['inventario-alertas'] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo registrar el movimiento.',
      });
    },
  });

  const validado = productoId !== '' && motivo !== '' && cantidadValida && !excedeSalida;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validado || registrarMutation.isPending) return;
    registrarMutation.mutate({
      producto_id: Number(productoId),
      tipo,
      motivo,
      cantidad: cantidadNum,
      descripcion: descripcion.trim(),
    });
  };

  const unidad = UNIDAD_LABEL[seleccionado?.unidad ?? 'UNIDAD'] ?? 'Und.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar movimiento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="mov-producto">
            Producto *
          </label>
          <select
            id="mov-producto"
            className={inputCls}
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            disabled={!!producto}
          >
            <option value="">Seleccione un producto…</option>
            {lista.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} — {p.nombre} (stock: {fmtCantidad(p.stock_actual)}{' '}
                {UNIDAD_LABEL[p.unidad] ?? p.unidad})
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelCls}>Tipo de movimiento *</span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {TIPO_MOVIMIENTO_OPCIONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id as typeof tipo)}
                className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                  tipo === t.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">{AYUDA_TIPO[tipo]}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="mov-motivo">
              Motivo *
            </label>
            <select
              id="mov-motivo"
              className={inputCls}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            >
              {MOTIVO_MOVIMIENTO_OPCIONES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="mov-cantidad">
              {tipo === 'AJUSTE' ? 'Stock contado (conteo físico) *' : `Cantidad (${unidad}) *`}
            </label>
            <input
              id="mov-cantidad"
              type="number"
              min={0}
              step="any"
              className={inputCls}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {seleccionado && (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              excedeSalida
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            Stock actual:{' '}
            <strong>
              {fmtCantidad(stockActual)} {unidad}
            </strong>
            {resultante !== null && (
              <>
                {' → '}Stock resultante:{' '}
                <strong>
                  {fmtCantidad(resultante)} {unidad}
                </strong>
              </>
            )}
            {excedeSalida && (
              <p className="mt-1 text-xs font-medium">
                La salida excede el stock disponible.
              </p>
            )}
          </div>
        )}

        <div>
          <label className={labelCls} htmlFor="mov-descripcion">
            Referencia / observación
          </label>
          <textarea
            id="mov-descripcion"
            className={inputCls}
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Orden de trabajo, número de compra, motivo del conteo…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnSecundarioCls}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!validado || registrarMutation.isPending}
            className={btnPrimarioCls}
          >
            {registrarMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar movimiento
          </button>
        </div>
      </form>
    </Modal>
  );
}
