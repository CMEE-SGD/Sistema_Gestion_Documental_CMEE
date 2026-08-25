import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../shared/utils/ids';

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
    persona_id?: number;
}

interface PersonaOption {
    id: number;
    nombre: string;
    apellidos: string;
    puestos?: { puesto?: { nombre: string }; departamento?: { nombre: string } }[];
}

const emptyResp = (): ResponsableRow => ({ nombre: '', cargo: '', fecha: '', persona_id: undefined });

const RespSection = ({ title, items, personas, onChange, onAdd, onRemove }: {
    title: string;
    items: ResponsableRow[];
    personas: PersonaOption[];
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
                    <select
                        value={r.nombre || ''}
                        onChange={e => {
                            const fullName = e.target.value;
                            if (!fullName) {
                                onChange(idx, 'nombre', '');
                                onChange(idx, 'cargo', '');
                                return;
                            }
                            const p = personas.find(x => `${x.nombre} ${x.apellidos}` === fullName);
                            if (p) {
                                onChange(idx, 'nombre', fullName);
                                const pp = p.puestos?.[0];
                                const cargo = pp ? `${pp.puesto?.nombre || ''}${pp.departamento?.nombre ? ' - ' + pp.departamento.nombre : ''}` : '';
                                onChange(idx, 'cargo', cargo);
                            }
                        }}
                        className={inputCls}
                    >
                        <option value="">— Seleccionar persona —</option>
                        {personas.map(p => (
                            <option key={p.id} value={`${p.nombre} ${p.apellidos}`}>{p.nombre} {p.apellidos}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Cargo</label>
                    <input type="text" value={r.cargo} onChange={e => onChange(idx, 'cargo', e.target.value)} className={inputCls} placeholder="Se llena automáticamente" />
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

export const RiesgoSeguimientoPage = () => {
    const { id: rawId } = useParams<{id: string}>();
    const id = decodeId(rawId!);
    const [searchParams] = useSearchParams();
    const seccion = searchParams.get('seccion') || 'valoracion';
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [codigo, setCodigo] = useState('');
    const [form, setForm] = useState<any>({});

    const [responsables, setResponsables] = useState<ResponsableRow[]>([]);
    const [personas, setPersonas] = useState<PersonaOption[]>([]);
    const [cerradaPorId, setCerradaPorId] = useState<number | ''>('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/riesgos/${encodeId(id)}`);
                const r = res.data;
                setCodigo(r.codigo);
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
                    const faseMap: Record<string, string> = { valoracion: 'VALORACION', tratamiento: 'TRATAMIENTO', seguimiento: 'SEGUIMIENTO' };
                    const faseActual = faseMap[seccion] || 'VALORACION';
                    const filtered = r.responsables.filter((x: any) => x.fase === faseActual);
                    if (filtered.length > 0) {
                        setResponsables(filtered.map((x: any) => ({
                            nombre: x.nombre || '',
                            cargo: x.cargo || '',
                            fecha: x.fecha ? x.fecha.slice(0, 10) : '',
                        })));
                    }
                }
            } catch {
                await alert({ message: 'No se pudo cargar el registro.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id, seccion]);

    useEffect(() => {
        api.get('/personas').then(r => setPersonas(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (form.cerrada_por && personas.length) {
            const found = personas.find(p => `${p.nombre} ${p.apellidos}` === form.cerrada_por);
            setCerradaPorId(found ? found.id : '');
        }
    }, [personas, form.cerrada_por]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleRespChange = (idx: number, field: keyof ResponsableRow, value: string) => {
        setResponsables(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const addResp = () => setResponsables(prev => [...prev, emptyResp()]);
    const removeResp = (idx: number) => setResponsables(prev => prev.filter((_, i) => i !== idx));

    const { nivel, condicion } = calcularNivel(
        Number(form.probabilidad) || 0,
        Number(form.impacto) || 0,
        Number(form.deteccion) || 0,
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const faseMap: Record<string, string> = { valoracion: 'VALORACION', tratamiento: 'TRATAMIENTO', seguimiento: 'SEGUIMIENTO' };
            const faseActual = faseMap[seccion] || 'VALORACION';

            const buildResp = () =>
                responsables.filter(r => r.nombre.trim()).map(r => ({
                    fase: faseActual,
                    nombre: r.nombre,
                    cargo: r.cargo || null,
                    fecha: r.fecha || null,
                }));

            let payload: any = {};
            if (seccion === 'valoracion') {
                payload = {
                    probabilidad: Number(form.probabilidad),
                    impacto: Number(form.impacto),
                    deteccion: Number(form.deteccion),
                    responsables: buildResp(),
                };
            } else if (seccion === 'tratamiento') {
                payload = {
                    tratamiento: form.tratamiento || null,
                    acciones: form.acciones || null,
                    fecha_limite: form.fecha_limite || null,
                    observaciones: form.observaciones || null,
                    estado: 'EN_SEGUIMIENTO',
                    responsables: buildResp(),
                };
            } else if (seccion === 'seguimiento') {
                payload = {
                    verificacion_eficacia: form.verificacion_eficacia || null,
                    cierre_fecha: form.cierre_fecha || null,
                    cerrada_por: form.cerrada_por || null,
                    estado: 'CERRADO',
                    responsables: buildResp(),
                };
            }
            await api.patch(`/calidad/riesgos/${encodeId(id)}`, payload);
            toast({ message: 'Seguimiento actualizado correctamente.' });
            navigate(`/calidad/riesgos/${encodeId(id)}`);
        } catch (error: any) {
            await alert({ message: error?.response?.data?.message || 'Error al guardar el seguimiento.' });
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;

    const renderResponsables = () => (
        <RespSection title="Responsables" items={responsables} personas={personas} onChange={handleRespChange} onAdd={addResp} onRemove={removeResp} />
    );

    const secciones: Record<string, { titulo: string; color: string; contenido: JSX.Element }> = {
        valoracion: {
            titulo: 'VALORACIÓN DEL RIESGO (Nivel = P × I × D)',
            color: 'bg-amber-500',
            contenido: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
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
                    {renderResponsables()}
                </div>
            ),
        },
        tratamiento: {
            titulo: 'TRATAMIENTO',
            color: 'bg-blue-500',
            contenido: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
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
                    {renderResponsables()}
                </div>
            ),
        },
        seguimiento: {
            titulo: 'SEGUIMIENTO Y CIERRE',
            color: 'bg-emerald-500',
            contenido: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
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
                        <select value={cerradaPorId} onChange={e => {
                          const pid = Number(e.target.value);
                          if (!pid) { setCerradaPorId(''); setForm((prev: any) => ({ ...prev, cerrada_por: '' })); return; }
                          const p = personas.find(x => x.id === pid);
                          if (p) { setCerradaPorId(pid); setForm((prev: any) => ({ ...prev, cerrada_por: `${p.nombre} ${p.apellidos}` })); }
                        }} className={`${inputCls} bg-white`}>
                          <option value="">— Seleccionar persona —</option>
                          {personas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>)}
                        </select>
                    </div>
                    {renderResponsables()}
                </div>
            ),
        },
    };

    const sec = secciones[seccion] || secciones.valoracion;

    return (
        <div className="p-6">
            <button onClick={() => navigate(`/calidad/riesgos/${encodeId(id)}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a {codigo}
            </button>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                    <div className={`${sec.color} text-white px-3 py-2 text-sm font-semibold rounded-t`}>
                        {sec.titulo}
                    </div>
                    {sec.contenido}
                </div>

                <div className="flex justify-end gap-3 px-4 pb-4">
                    <button type="button" onClick={() => navigate(`/calidad/riesgos/${encodeId(id)}`)} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <Button type="submit" disabled={guardando}>
                        <Save className="w-4 h-4 mr-1" /> {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
