import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { decodeId } from '../../../shared/utils/ids';
import {
    ESTADO_ACCION_LABEL,
    ESTADO_ACCION_STYLES,
    ORIGEN_LABEL,
    TIPO_LABEL,
    TIPO_STYLES,
    rutaOrigen,
} from './acciones';
import { formatearFecha } from './trabajosNoConformes';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'text-sm font-medium text-gray-700';

export const AccionDetallePage = () => {
    const { id: rawId } = useParams<{ id: string }>();
    const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert, pedirMotivo } = useAlert();
    const { toast } = useToast();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState({
        tipo: 'CORRECTIVA',
        descripcion: '',
        causa: '',
        responsable: '',
        fecha_limite: '',
        estado: 'ABIERTA',
        eficaz: '' as '' | 'true' | 'false',
        verificacion_eficacia: '',
        fecha_cierre: '',
    });

    const puedeEditar = tienePermiso('Gestion de Calidad', 4);
    const puedeEliminar = tienePermiso('Gestion de Calidad', 5);

    const aplicar = (r: any) => {
        setItem(r);
        setForm({
            tipo: r.tipo,
            descripcion: r.descripcion || '',
            causa: r.causa || '',
            responsable: r.responsable || '',
            fecha_limite: r.fecha_limite ? r.fecha_limite.slice(0, 10) : '',
            estado: r.estado,
            eficaz: r.eficaz === true ? 'true' : r.eficaz === false ? 'false' : '',
            verificacion_eficacia: r.verificacion_eficacia || '',
            fecha_cierre: r.fecha_cierre ? r.fecha_cierre.slice(0, 10) : '',
        });
    };

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/acciones/${id}`);
                aplicar(res.data);
            } catch {
                await alert({ message: 'No se pudo cargar la acción.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const motivo = await pedirMotivo({
            title: 'Guardar cambios',
            message: 'Va a modificar esta acción.',
            confirmLabel: 'Guardar',
        });
        if (!motivo) return;
        setGuardando(true);
        try {
            const res = await api.patch(
                `/calidad/acciones/${id}`,
                {
                    tipo: form.tipo,
                    descripcion: form.descripcion,
                    causa: form.causa || null,
                    responsable: form.responsable || null,
                    fecha_limite: form.fecha_limite || null,
                    estado: form.estado,
                    eficaz: form.eficaz === '' ? null : form.eficaz === 'true',
                    verificacion_eficacia: form.verificacion_eficacia || null,
                    fecha_cierre: form.fecha_cierre || null,
                },
                { motivo },
            );
            aplicar(res.data);
            toast({ message: 'Acción actualizada correctamente.' });
        } catch (error: any) {
            await alert({ message: error?.response?.data?.message || 'Error al guardar la acción.' });
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async () => {
        const motivo = await pedirMotivo({
            title: 'Eliminar acción',
            message: '¿Está seguro de eliminar esta acción?',
            confirmLabel: 'Eliminar',
        });
        if (!motivo) return;
        try {
            await api.delete(`/calidad/acciones/${id}`, { motivo });
            toast({ message: 'Acción eliminada.' });
            navigate('/calidad/acciones');
        } catch {
            await alert({ message: 'Error al eliminar la acción.' });
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Cargando...</div>;
    if (!item) return <div className="text-center py-10 text-gray-400">Acción no encontrada</div>;

    const ruta = rutaOrigen(item.origen);

    return (
        <div>
            <button
                onClick={() => navigate('/calidad/acciones')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a Acciones
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h2 className="font-mono font-bold text-gray-800">{item.codigo}</h2>
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${TIPO_STYLES[item.tipo]}`}>{TIPO_LABEL[item.tipo]}</span>
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${ESTADO_ACCION_STYLES[item.estado]}`}>{ESTADO_ACCION_LABEL[item.estado]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {puedeEliminar && (
                            <button
                                onClick={eliminar}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Origen */}
                <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                        <span className="font-semibold text-gray-700">Origen:</span>{' '}
                        <span className="text-gray-600">
                            {ORIGEN_LABEL[item.origen_tipo]} — <span className="font-mono">{item.origen?.codigo || 'registro no disponible'}</span>
                        </span>
                    </div>
                    {ruta ? (
                        <Button variant="default" onClick={() => navigate(ruta)}>
                            <ExternalLink className="w-4 h-4 mr-1" /> Ir al origen
                        </Button>
                    ) : (
                        <span className="text-xs text-gray-400">El registro de origen ya no está disponible.</span>
                    )}
                </div>

                {puedeEditar ? (
                    <form onSubmit={guardar}>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>Tipo</label>
                                <select name="tipo" value={form.tipo} onChange={handleChange} className={`${inputCls} bg-white`}>
                                    <option value="CORRECTIVA">Correctiva</option>
                                    <option value="PREVENTIVA">Preventiva</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>Estado</label>
                                <select name="estado" value={form.estado} onChange={handleChange} className={`${inputCls} bg-white`}>
                                    {Object.entries(ESTADO_ACCION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className={labelCls}>Descripción de la acción</label>
                                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className={inputCls} required />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className={labelCls}>Causa</label>
                                <textarea name="causa" value={form.causa} onChange={handleChange} rows={2} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>Responsable</label>
                                <input type="text" name="responsable" value={form.responsable} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>Fecha límite</label>
                                <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>¿Eficaz?</label>
                                <select name="eficaz" value={form.eficaz} onChange={handleChange} className={`${inputCls} bg-white`}>
                                    <option value="">Pendiente</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelCls}>Fecha de cierre</label>
                                <input type="date" name="fecha_cierre" value={form.fecha_cierre} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className={labelCls}>Verificación de eficacia</label>
                                <textarea name="verificacion_eficacia" value={form.verificacion_eficacia} onChange={handleChange} rows={3} className={inputCls} placeholder="Evidencias de que la acción eliminó la causa..." />
                            </div>
                        </div>
                        <div className="flex justify-end px-4 pb-4 pt-2 border-t border-gray-100">
                            <Button type="submit" disabled={guardando}>
                                <Save className="w-4 h-4 mr-1" /> {guardando ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="md:col-span-2"><span className="font-semibold text-gray-700">Descripción:</span><p className="text-gray-600 whitespace-pre-wrap mt-1">{item.descripcion}</p></div>
                        <div className="md:col-span-2"><span className="font-semibold text-gray-700">Causa:</span><p className="text-gray-600 whitespace-pre-wrap mt-1">{item.causa || '—'}</p></div>
                        <div><span className="font-semibold text-gray-700">Responsable:</span> <span className="text-gray-600">{item.responsable || '—'}</span></div>
                        <div><span className="font-semibold text-gray-700">Fecha límite:</span> <span className="text-gray-600">{formatearFecha(item.fecha_limite)}</span></div>
                        <div><span className="font-semibold text-gray-700">¿Eficaz?:</span> <span className="text-gray-600">{item.eficaz === true ? 'Sí' : item.eficaz === false ? 'No' : 'Pendiente'}</span></div>
                        <div><span className="font-semibold text-gray-700">Fecha de cierre:</span> <span className="text-gray-600">{formatearFecha(item.fecha_cierre)}</span></div>
                        <div className="md:col-span-2"><span className="font-semibold text-gray-700">Verificación de eficacia:</span><p className="text-gray-600 whitespace-pre-wrap mt-1">{item.verificacion_eficacia || '—'}</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};
