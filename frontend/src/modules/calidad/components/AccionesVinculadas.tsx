import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { encodeId } from '../../../shared/utils/ids';
import {
    ESTADO_ACCION_LABEL,
    ESTADO_ACCION_STYLES,
    TIPO_LABEL,
    TIPO_STYLES,
    etiquetaPersonaOrdenada,
    nombrePersona,
    ordenarPersonas,
    type OrigenAccion,
} from '../pages/acciones';
import { formatearFecha } from '../pages/trabajosNoConformes';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'text-sm font-medium text-gray-700';

const vacio = () => ({ tipo: 'CORRECTIVA', descripcion: '', causa: '', responsable_id: '', fecha_limite: '' });

/**
 * Acciones correctivas / preventivas de un registro de origen. Se pueden
 * registrar varias; cada una abre su detalle en el módulo de Acciones.
 */
export const AccionesVinculadas = ({ origenTipo, origenId }: { origenTipo: OrigenAccion; origenId: number }) => {
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [acciones, setAcciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [abierto, setAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState(vacio());
    const [personas, setPersonas] = useState<any[]>([]);

    useEffect(() => {
        api.get('/personas').then((r) => setPersonas(Array.isArray(r.data) ? ordenarPersonas(r.data) : [])).catch(() => {});
    }, []);

    const puedeCrear = tienePermiso('Gestion de Calidad', 5);

    const cargar = async () => {
        try {
            const res = await api.get('/calidad/acciones', { params: { origen_tipo: origenTipo, origen_id: origenId } });
            setAcciones(Array.isArray(res.data) ? res.data : []);
        } catch {
            setAcciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [origenTipo, origenId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            await api.post('/calidad/acciones', {
                tipo: form.tipo,
                origen_tipo: origenTipo,
                origen_id: origenId,
                descripcion: form.descripcion,
                causa: form.causa || undefined,
                responsable_id: form.responsable_id ? Number(form.responsable_id) : undefined,
                fecha_limite: form.fecha_limite || undefined,
            });
            toast({ message: 'Acción registrada correctamente.' });
            setForm(vacio());
            setAbierto(false);
            await cargar();
        } catch (error: any) {
            await alert({ message: error?.response?.data?.message || 'Error al registrar la acción.' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-4 pt-0">
            <div className="bg-indigo-500 text-white px-3 py-2 text-sm font-semibold rounded-t flex items-center justify-between">
                <span>ACCIONES CORRECTIVAS / PREVENTIVAS</span>
                {puedeCrear && !abierto && (
                    <button
                        type="button"
                        onClick={() => setAbierto(true)}
                        className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Nueva acción
                    </button>
                )}
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b">
                {abierto && (
                    <form onSubmit={guardar} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Tipo</label>
                            <select name="tipo" value={form.tipo} onChange={handleChange} className={`${inputCls} bg-white`}>
                                <option value="CORRECTIVA">Correctiva</option>
                                <option value="PREVENTIVA">Preventiva</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Fecha límite</label>
                            <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className={labelCls}>Descripción de la acción</label>
                            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className={inputCls} required />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className={labelCls}>Causa (opcional)</label>
                            <textarea name="causa" value={form.causa} onChange={handleChange} rows={2} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className={labelCls}>Responsable</label>
                            <select name="responsable_id" value={form.responsable_id} onChange={handleChange} className={`${inputCls} bg-white`}>
                                <option value="">— Sin asignar —</option>
                                {personas.map((p) => (
                                    <option key={p.id} value={p.id}>{etiquetaPersonaOrdenada(p)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setAbierto(false); setForm(vacio()); }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar acción'}</Button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="px-4 py-4 text-sm text-gray-400">Cargando...</div>
                ) : acciones.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-gray-400">No hay acciones registradas para este registro.</div>
                ) : (
                    <table className="w-full text-sm text-gray-600">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="text-left px-4 py-2">Código</th>
                                <th className="text-left px-4 py-2">Tipo</th>
                                <th className="text-left px-4 py-2">Descripción</th>
                                <th className="text-left px-4 py-2">Responsable</th>
                                <th className="text-left px-4 py-2">Fecha límite</th>
                                <th className="text-left px-4 py-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acciones.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/calidad/acciones/${encodeId(a.id)}`)}
                                >
                                    <td className="px-4 py-2 font-mono text-xs font-bold text-gray-700">{a.codigo}</td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${TIPO_STYLES[a.tipo]}`}>{TIPO_LABEL[a.tipo]}</span>
                                    </td>
                                    <td className="px-4 py-2 max-w-sm truncate">{a.descripcion}</td>
                                    <td className="px-4 py-2">{nombrePersona(a.responsable)}</td>
                                    <td className="px-4 py-2">{formatearFecha(a.fecha_limite)}</td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${ESTADO_ACCION_STYLES[a.estado]}`}>{ESTADO_ACCION_LABEL[a.estado]}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
