import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const PROCESOS = [
    { value: 'DCM', label: 'Direccionamiento Operativo (DCM)' },
    { value: 'JDT_CALIBRACION', label: 'Calibración y Caracterización (JDT)' },
    { value: 'JDT_EQUIPOS', label: 'Gestión Equipos y Patrones (JDT)' },
    { value: 'RSEC', label: 'Recepción, Entrega y Facturación (RSEC)' },
    { value: 'JDC_DESEMPENO', label: 'Desempeño Organizacional (JDC)' },
    { value: 'JDC_IMPARCIALIDAD', label: 'Imparcialidad (JDC)' },
    { value: 'JDA', label: 'Gestión Administrativa (JDA)' },
];

const TRATAMIENTOS = [
    { value: 'EVITAR', label: 'Evitar' },
    { value: 'REDUCIR', label: 'Reducir' },
    { value: 'ASUMIR', label: 'Asumir' },
];

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';

interface ResponsableRow {
    nombre: string;
    cargo: string;
    fecha: string;
}

const emptyResp = (): ResponsableRow => ({ nombre: '', cargo: '', fecha: '' });

const RespSection = ({ title, items, onChange, onAdd, onRemove }: {
    title: string;
    items: ResponsableRow[];
    onChange: (idx: number, field: keyof ResponsableRow, value: string) => void;
    onAdd: () => void;
    onRemove: (idx: number) => void;
}) => (
    <div className="mt-3 pt-3 border-t border-gray-200">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{title}</label>
        {items.map((r, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Nombre</label>
                    <input type="text" value={r.nombre} onChange={e => onChange(idx, 'nombre', e.target.value)} className={inputCls} placeholder="Nombre completo" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Cargo</label>
                    <input type="text" value={r.cargo} onChange={e => onChange(idx, 'cargo', e.target.value)} className={inputCls} placeholder="Cargo o función" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Fecha</label>
                    <div className="flex gap-2">
                        <input type="date" value={r.fecha} onChange={e => onChange(idx, 'fecha', e.target.value)} className={inputCls} />
                        <button type="button" onClick={() => onRemove(idx)} className="px-2 text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        ))}
        <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors mt-1">
            <Plus className="w-3 h-3" /> Agregar responsable
        </button>
    </div>
);

const calcularNivel = (p: number, i: number, d: number) => {
    const nivel = p * i * d;
    if (nivel >= 200) return { nivel, condicion: 'ALTO' };
    if (nivel >= 80) return { nivel, condicion: 'MODERADO' };
    return { nivel, condicion: 'LEVE' };
};

const condicionBadge: Record<string, string> = {
    ALTO: 'bg-red-100 text-red-700 border-red-300',
    MODERADO: 'bg-orange-100 text-orange-700 border-orange-300',
    LEVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

export const RiesgoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const esEdicion = !!id;
    const [loading, setLoading] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);

    const [form, setForm] = useState({
        tipo: 'RIESGO',
        proceso: '',
        evento: '',
        causa: '',
        fuente: '',
        consecuencias: '',
        probabilidad: 1,
        impacto: 1,
        deteccion: 1,
        nivel_riesgo: 0,
        tratamiento: '',
        acciones: '',
        fecha_limite: '',
        verificacion_eficacia: '',
        cierre_fecha: '',
        cerrada_por: '',
        estado: 'IDENTIFICADO',
        observaciones: '',
    });

    const [respIdentificacion, setRespIdentificacion] = useState<ResponsableRow[]>([]);
    const [respValoracion, setRespValoracion] = useState<ResponsableRow[]>([]);
    const [respTratamiento, setRespTratamiento] = useState<ResponsableRow[]>([]);
    const [respSeguimiento, setRespSeguimiento] = useState<ResponsableRow[]>([]);

    useEffect(() => {
        if (!esEdicion) return;
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/riesgos/${id}`);
                const r = res.data;
                setForm({
                    tipo: r.tipo || 'RIESGO',
                    proceso: r.proceso || '',
                    evento: r.evento || '',
                    causa: r.causa || '',
                    fuente: r.fuente || '',
                    consecuencias: r.consecuencias || '',
                    probabilidad: r.probabilidad ?? 1,
                    impacto: r.impacto ?? 1,
                    deteccion: r.deteccion ?? 1,
                    nivel_riesgo: r.nivel_riesgo ?? 0,
                    tratamiento: r.tratamiento || '',
                    acciones: r.acciones || '',
                    fecha_limite: r.fecha_limite ? r.fecha_limite.slice(0, 10) : '',
                    verificacion_eficacia: r.verificacion_eficacia || '',
                    cierre_fecha: r.cierre_fecha ? r.cierre_fecha.slice(0, 10) : '',
                    cerrada_por: r.cerrada_por || '',
                    estado: r.estado || 'IDENTIFICADO',
                    observaciones: r.observaciones || '',
                });
                if (Array.isArray(r.responsables)) {
                    const toRow = (x: any): ResponsableRow => ({
                        nombre: x.nombre || '',
                        cargo: x.cargo || '',
                        fecha: x.fecha ? x.fecha.slice(0, 10) : '',
                    });
                    setRespIdentificacion(r.responsables.filter((x: any) => x.fase === 'IDENTIFICACION').map(toRow));
                    setRespValoracion(r.responsables.filter((x: any) => x.fase === 'VALORACION').map(toRow));
                    setRespTratamiento(r.responsables.filter((x: any) => x.fase === 'TRATAMIENTO').map(toRow));
                    setRespSeguimiento(r.responsables.filter((x: any) => x.fase === 'SEGUIMIENTO').map(toRow));
                }
            } catch {
                await alert({ message: 'No se pudo cargar el registro.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const makeRespHandlers = (setter: React.Dispatch<React.SetStateAction<ResponsableRow[]>>) => ({
        onChange: (idx: number, field: keyof ResponsableRow, value: string) =>
            setter(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r)),
        onAdd: () => setter(prev => [...prev, emptyResp()]),
        onRemove: (idx: number) => setter(prev => prev.filter((_, i) => i !== idx)),
    });

    const { nivel, condicion } = calcularNivel(
        Number(form.probabilidad) || 0,
        Number(form.impacto) || 0,
        Number(form.deteccion) || 0,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const buildResp = (items: ResponsableRow[], fase: string) =>
                items.filter(r => r.nombre.trim()).map(r => ({
                    fase,
                    nombre: r.nombre,
                    cargo: r.cargo || null,
                    fecha: r.fecha || null,
                }));

            const allResponsables = [
                ...buildResp(respIdentificacion, 'IDENTIFICACION'),
                ...buildResp(respValoracion, 'VALORACION'),
                ...buildResp(respTratamiento, 'TRATAMIENTO'),
                ...buildResp(respSeguimiento, 'SEGUIMIENTO'),
            ];

            const payload: any = {
                tipo: form.tipo,
                proceso: form.proceso,
                evento: form.evento,
                causa: form.causa || null,
                fuente: form.fuente || null,
                consecuencias: form.consecuencias || null,
                probabilidad: Number(form.probabilidad),
                impacto: Number(form.impacto),
                deteccion: Number(form.deteccion),
                tratamiento: form.tratamiento || null,
                acciones: form.acciones || null,
                fecha_limite: form.fecha_limite || null,
                verificacion_eficacia: form.verificacion_eficacia || null,
                cierre_fecha: form.cierre_fecha || null,
                cerrada_por: form.cerrada_por || null,
                estado: form.estado,
                observaciones: form.observaciones || null,
                responsables: allResponsables,
            };
            if (esEdicion) {
                await api.patch(`/calidad/riesgos/${id}`, payload);
                toast({ message: 'Registro actualizado correctamente.' });
            } else {
                await api.post('/calidad/riesgos', payload);
                toast({ message: 'Riesgo/Oportunidad registrado correctamente.' });
            }
            navigate('/calidad/riesgos');
        } catch (error: any) {
            await alert({ message: error?.response?.data?.message || 'Error al guardar el registro.' });
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;

    const showValoracion = esEdicion && (form.probabilidad > 1 || form.impacto > 1 || form.deteccion > 1 || form.nivel_riesgo > 0);
    const showTratamiento = esEdicion && !!form.acciones;
    const showSeguimiento = esEdicion && !!form.verificacion_eficacia;

    return (
        <div className="p-6">
            <button onClick={() => navigate('/calidad/riesgos')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a Riesgos y Oportunidades
            </button>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                {/* ============ IDENTIFICACIÓN ============ */}
                <div className="bg-[#88bddf] text-white px-4 py-3 text-sm font-semibold">
                    IDENTIFICACIÓN
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Tipo <span className="text-red-500">*</span></label>
                        <select name="tipo" value={form.tipo} onChange={handleChange} className={`${inputCls} bg-white`}>
                            <option value="RIESGO">Riesgo</option>
                            <option value="OPORTUNIDAD">Oportunidad</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Proceso (Cadena de Valor) <span className="text-red-500">*</span></label>
                        <select name="proceso" required value={form.proceso} onChange={handleChange} className={`${inputCls} bg-white`}>
                            <option value="">Seleccione el proceso...</option>
                            {PROCESOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Evento <span className="text-red-500">*</span></label>
                        <textarea name="evento" required value={form.evento} onChange={handleChange} rows={3} className={inputCls} placeholder="Describa el evento en el que se puede presentar el riesgo u oportunidad..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Causas</label>
                        <textarea name="causa" value={form.causa} onChange={handleChange} rows={2} className={inputCls} placeholder="Causas que lo originan..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Fuente de procedencia</label>
                        <input type="text" name="fuente" value={form.fuente} onChange={handleChange} className={inputCls} placeholder="Interna / Externa" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Consecuencias</label>
                        <textarea name="consecuencias" value={form.consecuencias} onChange={handleChange} rows={2} className={inputCls} placeholder="Posibles consecuencias si se materializa..." />
                    </div>
                    <div className="md:col-span-2">
                        <RespSection title="Responsables de Identificación" items={respIdentificacion} {...makeRespHandlers(setRespIdentificacion)} />
                    </div>
                </div>

                {/* ============ VALORACIÓN ============ */}
                {showValoracion && (
                    <>
                        <div className="bg-amber-500 text-white px-4 py-3 text-sm font-semibold">
                            VALORACIÓN DEL RIESGO (Nivel = P × I × D)
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Probabilidad (P) <span className="text-red-500">*</span></label>
                                <input type="number" min={1} max={10} name="probabilidad" required value={form.probabilidad} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Impacto / Severidad (I) <span className="text-red-500">*</span></label>
                                <input type="number" min={1} max={10} name="impacto" required value={form.impacto} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Capacidad de Detección (D) <span className="text-red-500">*</span></label>
                                <input type="number" min={1} max={10} name="deteccion" required value={form.deteccion} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex items-center gap-3 md:col-span-3 border border-gray-300 rounded-md bg-gray-50 px-4 py-3">
                                <span className="text-sm font-medium text-gray-700">Nivel de riesgo:</span>
                                <span className="text-lg font-bold text-gray-800">{nivel}</span>
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${condicionBadge[condicion]}`}>{condicion}</span>
                                <span className="text-[11px] text-gray-400">≥ 200 Alto · 80-199 Moderado · &lt; 80 Leve</span>
                            </div>
                            <div className="md:col-span-3">
                                <RespSection title="Responsables de Valoración" items={respValoracion} {...makeRespHandlers(setRespValoracion)} />
                            </div>
                        </div>
                    </>
                )}

                {/* ============ TRATAMIENTO ============ */}
                {showTratamiento && (
                    <>
                        <div className="bg-blue-500 text-white px-4 py-3 text-sm font-semibold">
                            TRATAMIENTO
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Opción de tratamiento</label>
                                <select name="tratamiento" value={form.tratamiento} onChange={handleChange} className={`${inputCls} bg-white`}>
                                    <option value="">Seleccione...</option>
                                    {TRATAMIENTOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Fecha límite</label>
                                <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Acciones del plan</label>
                                <textarea name="acciones" value={form.acciones} onChange={handleChange} rows={3} className={inputCls} placeholder="Actividades para minimizar o eliminar los impactos..." />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Observaciones</label>
                                <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={2} className={inputCls} placeholder="Observaciones..." />
                            </div>
                            <div className="md:col-span-2">
                                <RespSection title="Responsables de Tratamiento" items={respTratamiento} {...makeRespHandlers(setRespTratamiento)} />
                            </div>
                        </div>
                    </>
                )}

                {/* ============ SEGUIMIENTO Y CIERRE ============ */}
                {showSeguimiento && (
                    <>
                        <div className="bg-emerald-500 text-white px-4 py-3 text-sm font-semibold">
                            SEGUIMIENTO Y CIERRE
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Verificación de eficacia</label>
                                <textarea name="verificacion_eficacia" value={form.verificacion_eficacia} onChange={handleChange} rows={3} className={inputCls} placeholder="Verificación de que las acciones fueron eficaces..." />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Fecha de cierre</label>
                                <input type="date" name="cierre_fecha" value={form.cierre_fecha} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Cerrada por</label>
                                <input type="text" name="cerrada_por" value={form.cerrada_por} onChange={handleChange} className={inputCls} placeholder="Nombre de quien cierra" />
                            </div>
                            <div className="md:col-span-2">
                                <RespSection title="Responsables de Seguimiento" items={respSeguimiento} {...makeRespHandlers(setRespSeguimiento)} />
                            </div>
                        </div>
                    </>
                )}

                {/* ============ BOTONES ============ */}
                <div className="flex justify-end gap-3 px-4 pb-4">
                    <button type="button" onClick={() => navigate(esEdicion ? `/calidad/riesgos/${id}` : '/calidad/riesgos')} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <Button type="submit" disabled={guardando}>
                        <Save className="w-4 h-4 mr-1" /> {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
