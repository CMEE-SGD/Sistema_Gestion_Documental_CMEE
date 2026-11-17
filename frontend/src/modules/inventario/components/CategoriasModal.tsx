import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Pencil, Plus, X } from 'lucide-react';
import api from '../../../core/api/axios';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador, tienePermiso } from '../../../shared/utils/auth';
import { CategoriaInsumo, btnPrimarioCls, btnSecundarioCls, inputCls } from '../inventarioUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Alta, renombrado y desactivación de categorías de insumos. */
export default function CategoriasModal({ isOpen, onClose }: Props) {
  const { alert, pedirMotivo } = useAlert();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [nueva, setNueva] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');

  const puedeEscribir = esUsuarioAdministrador() || tienePermiso('Inventario', 4);
  const puedeDesactivar = esUsuarioAdministrador() || tienePermiso('Inventario', 5);

  const { data: categorias = [], isLoading } = useQuery<CategoriaInsumo[]>({
    queryKey: ['inventario-categorias'],
    queryFn: async () => {
      const res = await api.get('/inventario/categorias');
      return res.data;
    },
    enabled: isOpen,
  });

  const invalidar = () => {
    void qc.invalidateQueries({ queryKey: ['inventario-categorias'] });
    void qc.invalidateQueries({ queryKey: ['inventario-productos'] });
  };

  const onError = (err: unknown, fallback: string) => {
    const apiErr = err as { response?: { data?: { message?: string } } };
    void alert({ message: apiErr?.response?.data?.message || fallback });
  };

  const crearMutation = useMutation({
    mutationFn: async (nombre: string) => {
      await api.post('/inventario/categorias', { nombre });
    },
    onSuccess: () => {
      toast({ message: 'Categoría creada.' });
      setNueva('');
      invalidar();
    },
    onError: (err: unknown) => onError(err, 'No se pudo crear la categoría.'),
  });

  const renombrarMutation = useMutation({
    mutationFn: async ({
      id,
      nombre,
      motivo,
    }: {
      id: number;
      nombre: string;
      motivo: string;
    }) => {
      await api.patch(`/inventario/categorias/${id}`, { nombre }, { motivo });
    },
    onSuccess: () => {
      toast({ message: 'Categoría actualizada.' });
      setEditandoId(null);
      invalidar();
    },
    onError: (err: unknown) => onError(err, 'No se pudo renombrar la categoría.'),
  });

  const desactivarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      await api.patch(`/inventario/categorias/${id}`, { activo: false }, { motivo });
    },
    onSuccess: () => {
      toast({ message: 'Categoría desactivada.' });
      invalidar();
    },
    onError: (err: unknown) => onError(err, 'No se pudo desactivar la categoría.'),
  });

  // Renombrar es un PATCH: el interceptor de auditoría exige motivo.
  const handleRenombrar = async (c: CategoriaInsumo) => {
    const motivo = await pedirMotivo({
      title: 'Renombrar categoría',
      message: `Va a renombrar la categoría "${c.nombre}" a "${nombreEdit.trim()}".`,
      confirmLabel: 'Guardar',
    });
    if (!motivo) return;
    renombrarMutation.mutate({ id: c.id, nombre: nombreEdit.trim(), motivo });
  };

  const handleDesactivar = async (c: CategoriaInsumo) => {
    const motivo = await pedirMotivo({
      title: 'Desactivar categoría',
      message: `¿Desactivar la categoría "${c.nombre}"? Los productos ya registrados la conservarán en su ficha.`,
      confirmLabel: 'Desactivar',
    });
    if (!motivo) return;
    desactivarMutation.mutate({ id: c.id, motivo });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Categorías de insumos">
      <div className="space-y-4">
        {puedeEscribir && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nueva.trim() && !crearMutation.isPending) crearMutation.mutate(nueva.trim());
            }}
          >
            <input
              className={inputCls}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva categoría (p. ej. Reactivos)…"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!nueva.trim() || crearMutation.isPending}
              className={btnPrimarioCls}
            >
              {crearMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar
            </button>
          </form>
        )}

        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
          {isLoading && (
            <p className="px-3 py-4 text-sm text-slate-500">Cargando categorías…</p>
          )}
          {!isLoading && categorias.length === 0 && (
            <p className="px-3 py-4 text-sm text-slate-500">
              Aún no hay categorías registradas.
            </p>
          )}
          {categorias.map((c) => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2">
              {editandoId === c.id ? (
                <>
                  <input
                    className={inputCls}
                    value={nombreEdit}
                    onChange={(e) => setNombreEdit(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <button
                    type="button"
                    title="Guardar"
                    disabled={!nombreEdit.trim() || renombrarMutation.isPending}
                    onClick={() => void handleRenombrar(c)}
                    className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Cancelar"
                    onClick={() => setEditandoId(null)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">{c.nombre}</span>
                  <span className="text-xs text-slate-400">
                    {c._count?.productos ?? 0} producto
                    {(c._count?.productos ?? 0) === 1 ? '' : 's'}
                  </span>
                  {puedeEscribir && (
                    <button
                      type="button"
                      title="Renombrar"
                      onClick={() => {
                        setEditandoId(c.id);
                        setNombreEdit(c.nombre);
                      }}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {puedeDesactivar && (
                    <button
                      type="button"
                      title="Desactivar"
                      onClick={() => void handleDesactivar(c)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={btnSecundarioCls}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
