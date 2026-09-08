import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface MoverCarpetaModalProps {
  item: any;
  carpetas: any[];
  onClose: () => void;
  onMoved: () => void;
}

const obtenerDescendientes = (carpetas: any[], padreId: number): number[] => {
  const hijos = carpetas.filter(c => c.carpeta_padre_id === padreId);
  let desc = hijos.map(h => h.id);
  hijos.forEach(h => { desc = [...desc, ...obtenerDescendientes(carpetas, h.id)]; });
  return desc;
};

const aplanarArbol = (carpetas: any[], padreId: number | null, depth: number, out: any[]) => {
  const hijos = carpetas
    .filter(c => c.carpeta_padre_id === padreId)
    .sort((a, b) => ((a.orden || 0) - (b.orden || 0)) || a.nombre.localeCompare(b.nombre));
  hijos.forEach(h => {
    out.push({ id: h.id, nombre: h.nombre, tipo: h.tipo, depth });
    aplanarArbol(carpetas, h.id, depth + 1, out);
  });
};

export const MoverCarpetaModal = ({ item, carpetas, onClose, onMoved }: MoverCarpetaModalProps) => {
  const { alert } = useAlert();
  const { toast } = useToast();
  const [destino, setDestino] = useState(item.carpeta_padre_id ? String(item.carpeta_padre_id) : '');
  const [guardando, setGuardando] = useState(false);

  const arbolPlano: any[] = [];
  aplanarArbol(carpetas, null, 0, arbolPlano);
  const descendientes = obtenerDescendientes(carpetas, item.id);
  const candidatas = arbolPlano.filter(o =>
    o.id !== item.id &&
    !descendientes.includes(o.id) &&
    (item.tipo === 'AREA' ? o.tipo === 'LIBRERIA' : (o.tipo === 'AREA' || o.tipo === 'SUBCARPETA'))
  );

  const guardar = async () => {
    if (!destino) {
      await alert({ message: 'Seleccione la carpeta destino.' });
      return;
    }
    setGuardando(true);
    try {
      await api.patch(`/carpetas/${item.id}`, { carpeta_padre_id: Number(destino) });
      toast({ message: 'Carpeta movida correctamente' });
      window.dispatchEvent(new Event('refreshCarpetas'));
      onMoved();
    } catch (error: any) {
      console.error('Error al mover:', error);
      await alert({ message: error?.response?.data?.message || 'Ocurrió un error al mover la carpeta.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-800">Mover carpeta: {item.nombre}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Carpeta destino</label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
            >
              <option value="">— Seleccione —</option>
              {candidatas.map(o => (
                <option key={o.id} value={o.id}>
                  {'— '.repeat(o.depth)}{o.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={guardar}
            disabled={guardando || !destino}
            className="px-4 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
          >
            {guardando ? 'Moviendo...' : 'Mover carpeta'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};