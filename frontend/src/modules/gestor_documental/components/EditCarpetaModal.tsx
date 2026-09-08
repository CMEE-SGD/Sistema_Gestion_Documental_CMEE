import { useState, useEffect } from 'react';
import { Folder, FileText, X, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const inputCls = 'w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500';

interface PermisoRow {
  persona_id: number;
  nivel_permiso: number;
  permiso_docs: boolean;
  permiso_carpetas: boolean;
}

interface EditCarpetaModalProps {
  carpetaId: number;
  onClose: () => void;
  onSaved: () => void;
}

export const EditCarpetaModal = ({ carpetaId, onClose, onSaved }: EditCarpetaModalProps) => {
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const [form, setForm] = useState({ nombre: '', descripcion: '', codigo: '', orden: 0, activo: true });
  const [permisos, setPermisos] = useState<Record<string, PermisoRow>>({});
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [carpetaNombre, setCarpetaNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resCarpetas, resDeptos] = await Promise.all([
          api.get(`/carpetas/${carpetaId}`),
          api.get('/departamentos'),
        ]);
        const completa = resCarpetas.data;
        const deptos = Array.isArray(resDeptos.data) ? resDeptos.data : [];
        setDepartamentos(deptos);
        setCarpetaNombre(completa.nombre || '');

        setForm({
          nombre: completa.nombre || '',
          descripcion: completa.descripcion || '',
          codigo: completa.codigo || '',
          orden: completa.orden || 0,
          activo: completa.activo ?? true,
        });

        const permisosMap: Record<string, PermisoRow> = {};
        (completa.permisos || []).forEach((p: any) => {
          if (p.persona_id) {
            permisosMap[`p_${p.persona_id}`] = {
              persona_id: p.persona_id,
              nivel_permiso: p.nivel_permiso || 1,
              permiso_docs: p.permiso_docs ?? false,
              permiso_carpetas: p.permiso_carpetas ?? false,
            };
          }
        });
        setPermisos(permisosMap);
      } catch {
        await alert({ message: 'No se pudieron cargar los datos.' });
        onClose();
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [carpetaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const permisosPayload = Object.values(permisos).map(val => ({
        persona_id: val.persona_id,
        nivel_permiso: val.nivel_permiso,
        permiso_docs: val.permiso_docs,
        permiso_carpetas: val.permiso_carpetas,
      }));

      await api.patch(`/carpetas/${carpetaId}`, {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        codigo: form.codigo || null,
        orden: form.orden,
        activo: form.activo,
        permisos: permisosPayload,
      });

      toast({ message: 'Guardado correctamente.' });
      onSaved();
    } catch (error: any) {
      await alert({ message: error?.response?.data?.message || 'Error al guardar.' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    const confirmado = await confirm({ message: `¿Eliminar "${carpetaNombre}"? Se eliminarán todas sus subcarpetas y documentos.` });
    if (!confirmado) return;
    try {
      await api.delete(`/carpetas/${carpetaId}`);
      toast({ message: 'Eliminada correctamente.' });
      onSaved();
    } catch (error: any) {
      await alert({ message: error?.response?.data?.message || 'Error al eliminar.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Editar: {carpetaNombre}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Cargando...</div>
        ) : (
          <div className="px-6 py-5">
            <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">Nombre:</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className={`${inputCls} font-semibold border-gray-800 border-2`} />

              <label className="text-sm font-medium text-gray-700">Descripción:</label>
              <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} className={inputCls} />

              <label className="text-sm font-medium text-gray-700">Código:</label>
              <input type="text" name="codigo" value={form.codigo} onChange={handleChange} className={`${inputCls} w-48`} />

              <label className="text-sm font-medium text-gray-700">Orden:</label>
              <input type="number" name="orden" value={form.orden} onChange={handleChange} className={`${inputCls} w-24`} />

              <label className="text-sm font-medium text-gray-700">Estado:</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Activa</span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Permisos de Acceso:</h4>
              <div className="w-full text-xs">
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-t px-3 py-2 font-semibold text-gray-700">
                  <div className="w-1/3">Departamento / Usuario</div>
                  <div className="w-1/4 text-center">Nivel</div>
                  <div className="flex-1 flex justify-around">
                    <span title="Crear Documentos"><FileText className="w-4 h-4 text-blue-800" /></span>
                    <span title="Crear Carpetas"><Folder className="w-4 h-4 text-yellow-600" /></span>
                  </div>
                </div>

                <div className="border border-t-0 border-gray-200 rounded-b divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {departamentos.filter((d: any) => d.puestos_asignados?.some((pa: any) => pa.persona)).map(depto => {
                    const usuarios = depto.puestos_asignados?.filter((pa: any) => pa.persona).map((pa: any) => pa.persona) || [];
                    const unicos = usuarios.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
                    const todosSeleccionados = unicos.length > 0 && unicos.every((p: any) => !!permisos[`p_${p.id}`]);

                    return (
                      <div key={depto.id}>
                        <div className="flex items-center px-3 py-2 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setExpandidos(prev => ({ ...prev, [depto.id]: !prev[depto.id] }))} className={`transform transition-transform ${expandidos[depto.id] ? 'rotate-90' : ''} text-gray-400`}>▶</button>
                            <input type="checkbox" checked={todosSeleccionados} onChange={(e) => {
                              if (e.target.checked) {
                                const nuevos: Record<string, PermisoRow> = {};
                                unicos.forEach((p: any) => { nuevos[`p_${p.id}`] = { persona_id: p.id, nivel_permiso: 5, permiso_docs: true, permiso_carpetas: true }; });
                                setPermisos(prev => ({ ...prev, ...nuevos }));
                              } else {
                                const rest = { ...permisos };
                                unicos.forEach((p: any) => delete rest[`p_${p.id}`]);
                                setPermisos(rest);
                              }
                            }} className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300" />
                            <span className="font-bold text-gray-800">{depto.nombre}</span>
                          </div>
                        </div>

                        {expandidos[depto.id] && unicos.length > 0 && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {unicos.map((persona: any) => {
                              const userKey = `p_${persona.id}`;
                              const userPerm = permisos[userKey] || { persona_id: persona.id, nivel_permiso: 5, permiso_docs: true, permiso_carpetas: true };
                              return (
                                <div key={persona.id} className="flex items-center px-10 py-1.5 hover:bg-white text-xs">
                                  <div className="w-1/3 flex items-center gap-2">
                                    <input type="checkbox" checked={!!permisos[userKey]} onChange={(e) => {
                                      if (e.target.checked) {
                                        setPermisos(prev => ({ ...prev, [userKey]: userPerm }));
                                      } else {
                                        const { [userKey]: _, ...rest } = permisos;
                                        setPermisos(rest);
                                      }
                                    }} className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                                    <span className="text-gray-700">{persona.nombre} {persona.apellidos}</span>
                                  </div>
                                  <div className="w-1/4 flex justify-center">
                                    <select value={userPerm.nivel_permiso} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, nivel_permiso: Number(e.target.value) } }))} disabled={!permisos[userKey]} className="border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 disabled:opacity-40">
                                      <option value={1}>Nivel 1: Ver</option>
                                      <option value={2}>Nivel 2: Ver y Descargar</option>
                                      <option value={3}>Nivel 3: Ver, Descargar y Editar</option>
                                      <option value={4}>Nivel 4: Ver, Descargar, Editar y Mover</option>
                                      <option value={5}>Nivel 5: Todos los privilegios</option>
                                    </select>
                                  </div>
                                  <div className="flex-1 flex justify-around">
                                    <input type="checkbox" checked={userPerm.permiso_docs} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, permiso_docs: e.target.checked } }))} disabled={!permisos[userKey]} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40" />
                                    <input type="checkbox" checked={userPerm.permiso_carpetas} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, permiso_carpetas: e.target.checked } }))} disabled={!permisos[userKey]} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button onClick={eliminar} className="px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={guardar} disabled={guardando || !form.nombre.trim()} className="px-5 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
