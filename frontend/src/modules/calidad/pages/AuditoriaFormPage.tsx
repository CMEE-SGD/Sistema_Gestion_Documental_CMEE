import { useState, useEffect, useRef, Fragment, type TextareaHTMLAttributes } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

const AutoGrowTextarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const autoGrow = () => {
        const el = ref.current;
        if (!el) return;
        const fila = el.closest('.cronograma-fila') as HTMLElement | null;
        if (fila) {
            const tas = Array.from(fila.querySelectorAll('textarea')) as HTMLTextAreaElement[];
            tas.forEach(ta => { ta.style.height = 'auto'; });
            const maxH = Math.max(...tas.map(ta => ta.scrollHeight), 1);
            tas.forEach(ta => { ta.style.height = `${maxH}px`; });
        } else {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    };
    useEffect(() => {
        autoGrow();
    });
    return <textarea ref={ref} onInput={autoGrow} {...props} />;
};

const SECCIONES_EQUIPO = [
    { value: 'EVALUADOR_LIDER', label: 'Evaluador líder' },
    { value: 'EVALUADOR_CALIDAD', label: 'Evaluador de gestión de la calidad' },
    { value: 'EVALUADOR_TECNICO', label: 'Evaluador Técnico' },
    { value: 'EVALUADOR_ENTRENAMIENTO', label: 'Evaluador en entrenamiento' },
    { value: 'OBSERVADOR', label: 'Observador' },
];

const GRUPOS_EQUIPO = [
    {
        key: 'INICIAL',
        label: null,
        secciones: ['EVALUADOR_LIDER', 'EVALUADOR_CALIDAD'],
        add: [],
    },
    { key: 'EVALUADOR_TECNICO', label: 'Evaluadores Técnicos', secciones: ['EVALUADOR_TECNICO'], add: [{ seccion: 'EVALUADOR_TECNICO', label: 'Agregar', designacion: 'ET' }] },
    { key: 'EVALUADOR_ENTRENAMIENTO', label: 'Evaluadores en entrenamiento', secciones: ['EVALUADOR_ENTRENAMIENTO'], add: [{ seccion: 'EVALUADOR_ENTRENAMIENTO', label: 'Agregar', designacion: 'EE' }] },
    { key: 'OBSERVADOR', label: 'Observadores', secciones: ['OBSERVADOR'], add: [{ seccion: 'OBSERVADOR', label: 'Agregar', designacion: 'OBS' }] },
];

const FIJAS_EQUIPO = [
    { seccion: 'EVALUADOR_LIDER', funcion: 'Evaluador líder', nombre: '', designacion: 'EL' },
    { seccion: 'EVALUADOR_CALIDAD', funcion: 'Evaluador de gestión de la calidad', nombre: '', designacion: 'EG' },
];

const asegurarFilasFijas = (lista: any[]) => {
    const copia = Array.isArray(lista) ? lista.map((m: any) => ({ ...m })) : [];
    for (const fija of FIJAS_EQUIPO) {
        const existente = copia.find((m: any) => m.seccion === fija.seccion);
        if (existente) {
            existente.funcion = fija.funcion;
            existente.designacion = fija.designacion;
        } else {
            copia.push({ ...fija });
        }
    }
    return copia;
};

const inputCls = 'border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full';
const textareaCls = 'border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden w-full';
const seccionCls = 'bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t';

const parseJson = (valor: any, fallback: any) => {
    if (valor == null || valor === '') return fallback;
    if (typeof valor === 'string') {
        try { return JSON.parse(valor); } catch { return fallback; }
    }
    return Array.isArray(valor) ? valor : fallback;
};

const normalizarCronograma = (lista: any[]) => {
    if (!Array.isArray(lista) || lista.length === 0) {
        return [{ fecha: '', actividades: [{ hora: '', actividad: '', evaluador: '', referencia: '' }] }];
    }
    if (lista[0] && Array.isArray(lista[0].actividades)) {
        return lista.map((g: any) => ({
            fecha: g.fecha || '',
            actividades: Array.isArray(g.actividades) ? g.actividades.map((a: any) => ({ hora: a.hora || '', actividad: a.actividad || '', evaluador: a.evaluador || '', referencia: a.referencia || '' })) : [],
        }));
    }
    const grupos: any[] = [];
    for (const row of lista) {
        const actividad = { hora: row.hora || '', actividad: row.actividad || '', evaluador: row.evaluador || '', referencia: row.referencia || '' };
        const ultimo = grupos[grupos.length - 1];
        if (ultimo && ultimo.fecha === (row.fecha || '')) {
            ultimo.actividades.push(actividad);
        } else {
            grupos.push({ fecha: row.fecha || '', actividades: [actividad] });
        }
    }
    return grupos;
};

const renumerarTestificaciones = (lista: any[]) => lista.map((t, idx) => ({ ...t, test: (idx + 1).toString() }));

export const AuditoriaFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [personas, setPersonas] = useState<any[]>([]);
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [archivoActual, setArchivoActual] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        codigo: '',
        tipo: 'INTERNA',
        estado: 'PLANIFICADA',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        objeto: '',
        alcance: '',
        responsable_id: '',
        responsable_auditoria: '',
        observaciones: '',
    });

    const [documentosReferenciaTexto, setDocumentosReferenciaTexto] = useState('');
    const [equipoAuditor, setEquipoAuditor] = useState<{ seccion: string; funcion: string; nombre: string; designacion: string }[]>(FIJAS_EQUIPO.map(f => ({ ...f })));
    const [cronograma, setCronograma] = useState<{ fecha: string; actividades: { hora: string; actividad: string; evaluador: string; referencia: string }[] }[]>([
        { fecha: '', actividades: [{ hora: '', actividad: '', evaluador: '', referencia: '' }] },
    ]);
    const [testificaciones, setTestificaciones] = useState<{ test: string; metodo_ensayo: string; metodo_magnitud: string; muestra: string; evaluador: string }[]>([]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const resPersonas = await api.get('/personas');
                setPersonas(resPersonas.data);
                try {
                    const resLabs = await api.get('/laboratorios');
                    setLaboratorios(resLabs.data);
                } catch {
                    setLaboratorios([]);
                }
                if (id) {
                    const res = await api.get(`/calidad/auditorias/${id}`);
                    const a = res.data;
                    setFormData({
                        codigo: a.codigo,
                        tipo: a.tipo,
                        estado: a.estado,
                        fecha_inicio: a.fecha_inicio ? a.fecha_inicio.split('T')[0] : '',
                        fecha_fin: a.fecha_fin ? a.fecha_fin.split('T')[0] : '',
                        descripcion: a.descripcion || '',
                        objeto: a.objeto || '',
                        alcance: a.alcance || '',
                        responsable_id: a.responsable_id?.toString() || '',
                        responsable_auditoria: a.responsable_auditoria || '',
                        observaciones: a.observaciones || '',
                    });
                    setDocumentosReferenciaTexto(parseJson(a.documentos_referencia, []).join('\n'));
                    setEquipoAuditor(asegurarFilasFijas(parseJson(a.equipo_auditor, [])));
                    setCronograma(normalizarCronograma(parseJson(a.cronograma, [])));
                    setTestificaciones(renumerarTestificaciones(parseJson(a.testificaciones, [])));
                    setArchivoActual(a.archivo_planificacion || null);
                } else {
                    const resCodigo = await api.get('/calidad/auditorias/siguiente-codigo');
                    setFormData(prev => ({ ...prev, codigo: resCodigo.data }));
                }
            } catch (error) {
                console.error('Error cargando datos', error);
            }
        };
        cargar();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleResponsableChange = (e: any) => {
        const value = e.target.value;
        const persona = personas.find(p => p.id === Number(value));
        const puestos = persona?.puestos?.filter((p: any) => p.activo)?.map((p: any) => p.puesto?.nombre).filter(Boolean) || [];
        setFormData(prev => ({ ...prev, responsable_id: value, responsable_auditoria: puestos.join(', ') }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            if (id) fd.append('codigo', formData.codigo);
            fd.append('tipo', formData.tipo);
            fd.append('estado', formData.estado);
            fd.append('fecha_inicio', formData.fecha_inicio);
            if (formData.fecha_fin) fd.append('fecha_fin', formData.fecha_fin);
            if (formData.descripcion) fd.append('descripcion', formData.descripcion);
            if (formData.objeto) fd.append('objeto', formData.objeto);
            if (formData.alcance) fd.append('alcance', formData.alcance);
            fd.append('responsable_id', parseInt(formData.responsable_id).toString());
            if (formData.responsable_auditoria) fd.append('responsable_auditoria', formData.responsable_auditoria);
            if (formData.observaciones) fd.append('observaciones', formData.observaciones);
            fd.append('documentos_referencia', JSON.stringify(documentosReferenciaTexto.split('\n').map(s => s.trim()).filter(Boolean)));
            fd.append('equipo_auditor', JSON.stringify(equipoAuditor));
            fd.append('cronograma', JSON.stringify(cronograma));
            fd.append('testificaciones', JSON.stringify(testificaciones));
            if (archivo) fd.append('archivo_planificacion', archivo);

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (id) {
                await api.patch(`/calidad/auditorias/${id}`, fd, config);
                toast({ message: 'Auditoría actualizada correctamente.' });
            } else {
                await api.post('/calidad/auditorias', fd, config);
                toast({ message: 'Auditoría creada correctamente.' });
            }
            navigate('/calidad/auditorias');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar la auditoría';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar Programa de Auditoría' : 'Programa de Auditoría'}</h1>
                <p className="text-sm text-gray-500">{id ? 'Modifique los datos del programa de auditoría' : 'Registre un nuevo programa de auditoría'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
                {/* Cabecera */}
                <div>
                    <div className={seccionCls}>DATOS GENERALES</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Código</label>
                            <input type="text" name="codigo" readOnly value={formData.codigo} className={`${inputCls} bg-gray-100 text-gray-700 cursor-not-allowed`} placeholder="Se genera automáticamente" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Tipo</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} className={`${inputCls} bg-white`}>
                                <option value="INTERNA">Interna</option>
                                <option value="EXTERNA">Externa</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} className={`${inputCls} bg-white`}>
                                <option value="PLANIFICADA">Planificada</option>
                                <option value="EN_CURSO">En curso</option>
                                <option value="CERRADA">Cerrada</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Fecha de inicio <span className="text-red-500">*</span></label>
                            <input type="date" name="fecha_inicio" required value={formData.fecha_inicio} onChange={handleChange} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <div className={seccionCls}>DESCRIPCIÓN</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <AutoGrowTextarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className={textareaCls} placeholder="Ej: Auditoría Interna 2025" />
                    </div>
                </div>

                {/* Objeto */}
                <div>
                    <div className={seccionCls}>OBJETO</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <AutoGrowTextarea name="objeto" value={formData.objeto} onChange={handleChange} rows={3} className={textareaCls} placeholder="Determinar si la gestión y las actividades del CMEE están conformes con los requisitos de la Norma NTE INEN ISO-IEC 17025..." />
                    </div>
                </div>

                {/* Alcance */}
                <div>
                    <div className={seccionCls}>ALCANCE</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <AutoGrowTextarea name="alcance" value={formData.alcance} onChange={handleChange} rows={3} className={textareaCls} placeholder="Aplica al sistema de gestión del Dpto. de Calidad y Dpto. Técnico del CMEE..." />
                    </div>
                </div>

                {/* Documentos de Referencia */}
                <div>
                    <div className={seccionCls}>DOCUMENTOS DE REFERENCIA</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <AutoGrowTextarea value={documentosReferenciaTexto} onChange={e => setDocumentosReferenciaTexto(e.target.value)} rows={6} className={textareaCls} placeholder="Manual de calidad&#10;Norma NTE INEN ISO/IEC 17025...&#10;(un documento por línea)" />
                    </div>
                </div>

                {/* Responsable de Auditoría */}
                <div>
                    <div className={seccionCls}>RESPONSABLE DE AUDITORÍA</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Responsable <span className="text-red-500">*</span></label>
                            <select name="responsable_id" required value={formData.responsable_id} onChange={handleResponsableChange} className={`${inputCls} bg-white`}>
                                <option value="">Seleccione un responsable...</option>
                                {personas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Designación del responsable</label>
                            <input type="text" name="responsable_auditoria" readOnly value={formData.responsable_auditoria} className={`${inputCls} bg-gray-100 text-gray-700 cursor-not-allowed`} placeholder="Se llena con el puesto de la persona" />
                        </div>
                    </div>
                </div>

                {/* Equipo Auditor */}
                <div>
                    <div className={seccionCls}>EQUIPO AUDITOR</div>
                    <div className="border border-t-0 border-gray-300 rounded-b overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                            <div className="col-span-4 px-3 py-2">Laboratorio</div>
                            <div className="col-span-4 px-3 py-2">Nombre</div>
                            <div className="col-span-3 px-3 py-2">Designación</div>
                            <div className="col-span-1 px-3 py-2 text-center"></div>
                        </div>
                        {GRUPOS_EQUIPO.map(grupo => {
                            const filas = grupo.key === 'INICIAL' ? [] : equipoAuditor.filter(m => grupo.secciones.includes(m.seccion));
                            return (
                                <div key={grupo.key}>
                                    {grupo.label && (
                                        <div className="grid grid-cols-12 bg-gray-100 border-y border-gray-300 text-xs font-bold text-gray-700 px-3 py-2">
                                            <div className="col-span-12">{grupo.label}</div>
                                        </div>
                                    )}
                                    {grupo.key === 'INICIAL' ? (
                                        <div className="p-3">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                {FIJAS_EQUIPO.map(fija => {
                                                    const idx = equipoAuditor.findIndex(m => m.seccion === fija.seccion);
                                                    const row = idx >= 0 ? equipoAuditor[idx] : fija;
                                                    const personaSel = row.nombre ? personas.find(p => `${p.nombre} ${p.apellidos}` === row.nombre) : null;
                                                    return (
                                                        <Fragment key={fija.seccion}>
                                                            <div className="md:col-span-4 border border-gray-300 rounded-md bg-gray-100 px-3 py-2 flex items-center text-sm font-medium text-gray-700">{fija.funcion}</div>
                                                            <div className="md:col-span-4">
                                                                <select value={personaSel?.id || ''} onChange={e => {
                                                                    const p = personas.find(x => x.id === Number(e.target.value));
                                                                    const c = [...equipoAuditor];
                                                                    const i = idx >= 0 ? idx : c.length;
                                                                    if (idx < 0) c.push({ ...fija });
                                                                    c[i] = { ...c[i], nombre: p ? `${p.nombre} ${p.apellidos}` : '' };
                                                                    setEquipoAuditor(c);
                                                                }} className={`${inputCls} bg-white`}>
                                                                    <option value="">Seleccione la persona...</option>
                                                                    {personas.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-3 border border-gray-300 rounded-md bg-gray-100 px-3 py-2 flex items-center justify-center text-sm font-semibold text-gray-600">{fija.designacion}</div>
                                                            <div className="md:col-span-1"></div>
                                                        </Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        filas.map(m => {
                                            const idx = equipoAuditor.findIndex(x => x === m);
                                            const personaSel = m.nombre ? personas.find(p => `${p.nombre} ${p.apellidos}` === m.nombre) : null;
                                            return (
                                                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 border-b border-gray-200 last:border-b-0 gap-2 p-2 md:gap-0 md:p-0">
                                                    <div className="col-span-4 p-1">
                                                        <select value={m.funcion} onChange={e => { const c = [...equipoAuditor]; c[idx].funcion = e.target.value; setEquipoAuditor(c); }} className={`${inputCls} bg-white`}>
                                                            <option value="">Seleccione el laboratorio...</option>
                                                            {laboratorios.map(l => (
                                                                <option key={l.id} value={l.nombre}>{l.nombre}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-4 p-1">
                                                        <select value={personaSel?.id || ''} onChange={e => {
                                                            const p = personas.find(x => x.id === Number(e.target.value));
                                                            const c = [...equipoAuditor];
                                                            c[idx].nombre = p ? `${p.nombre} ${p.apellidos}` : '';
                                                            setEquipoAuditor(c);
                                                        }} className={`${inputCls} bg-white`}>
                                                            <option value="">Seleccione la persona...</option>
                                                            {personas.map(p => (
                                                                <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3 p-1">
                                                        <input type="text" value={m.designacion} onChange={e => { const c = [...equipoAuditor]; c[idx].designacion = e.target.value; setEquipoAuditor(c); }} className={inputCls} placeholder="ET / EE / OBS" />
                                                    </div>
                                                    <div className="col-span-1 p-1 flex items-center justify-center">
                                                        <button type="button" onClick={() => setEquipoAuditor(equipoAuditor.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {grupo.add.length > 0 && (
                                        <div className="flex flex-wrap gap-3 px-2 py-1.5 bg-gray-50 border-b border-gray-200 last:border-b-0">
                                            {grupo.add.map(b => (
                                                <button key={b.seccion} type="button" onClick={() => {
                                                    const designacion = b.seccion === 'EVALUADOR_TECNICO'
                                                        ? `ET${equipoAuditor.filter(m => m.seccion === 'EVALUADOR_TECNICO').length + 1}`
                                                        : b.designacion;
                                                    setEquipoAuditor([...equipoAuditor, { seccion: b.seccion, funcion: '', nombre: '', designacion }]);
                                                }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                                    <Plus className="w-3 h-3 inline mr-1" />{b.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cronograma */}
                <div>
                    <div className={seccionCls}>CRONOGRAMA DE AUDITORÍA</div>
                    <div className="border border-t-0 border-gray-300 rounded-b overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                            <div className="col-span-3 px-3 py-2">Fecha/Hora</div>
                            <div className="col-span-3 px-3 py-2">Función o actividad a evaluar</div>
                            <div className="col-span-3 px-3 py-2">Evaluador</div>
                            <div className="col-span-3 px-3 py-2">Referencia normativa</div>
                        </div>
                        {cronograma.map((g, gi) => (
                            <Fragment key={gi}>
                                <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50 gap-2 p-2 md:gap-0 md:p-0">
                                    <div className="col-span-3 p-1 flex items-center justify-center">
                                        <input
                                            type="date"
                                            value={g.fecha}
                                            onChange={e => {
                                                const copy = [...cronograma];
                                                copy[gi].fecha = e.target.value;
                                                setCronograma(copy);
                                            }}
                                            /* Nota el 'pl-10' (padding-left) para empujar el texto y compensar el ícono */
                                            className="border border-gray-300 rounded-md py-2 pr-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-[150px] text-center"
                                        />
                                    </div>
                                    <div className="col-span-8"></div>
                                    <div className="col-span-1 p-1 flex items-center justify-center">
                                        <button type="button" onClick={() => setCronograma(cronograma.filter((_, idx) => idx !== gi))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {g.actividades.map((a, ai) => (
                                    <div key={ai} className="cronograma-fila grid grid-cols-1 md:grid-cols-12 border-b border-gray-200 last:border-b-0 gap-2 p-2 md:gap-0 md:p-0">
                                        <div className="col-span-3 p-1">
                                            <input type="text" value={a.hora} onChange={e => {
                                                const copy = [...cronograma];
                                                copy[gi].actividades[ai].hora = e.target.value;
                                                setCronograma(copy);
                                            }} className={inputCls} placeholder="09:00-09:30" />
                                        </div>
                                        <div className="col-span-3 p-1">
                                            <AutoGrowTextarea value={a.actividad} onChange={e => {
                                                const copy = [...cronograma];
                                                copy[gi].actividades[ai].actividad = e.target.value;
                                                setCronograma(copy);
                                            }} rows={2} className={textareaCls} placeholder="Actividad a evaluar" />
                                        </div>
                                        <div className="col-span-3 p-1">
                                            <AutoGrowTextarea value={a.evaluador} onChange={e => {
                                                const copy = [...cronograma];
                                                copy[gi].actividades[ai].evaluador = e.target.value;
                                                setCronograma(copy);
                                            }} rows={1} className={textareaCls} placeholder="EL, EG, ET..." />
                                        </div>
                                        <div className="col-span-3 p-1 flex gap-1 items-center">
                                            <AutoGrowTextarea value={a.referencia} onChange={e => {
                                                const copy = [...cronograma];
                                                copy[gi].actividades[ai].referencia = e.target.value;
                                                setCronograma(copy);
                                            }} rows={1} className={textareaCls} placeholder="8.1" />
                                            <button type="button" onClick={() => {
                                                const copy = [...cronograma];
                                                copy[gi].actividades = copy[gi].actividades.filter((_, idx) => idx !== ai);
                                                setCronograma(copy);
                                            }} className="text-red-500 hover:text-red-700 shrink-0"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-2 bg-gray-50 border-b border-gray-200">
                                    <button type="button" onClick={() => {
                                        const copy = [...cronograma];
                                        copy[gi].actividades = [...copy[gi].actividades, { hora: '', actividad: '', evaluador: '', referencia: '' }];
                                        setCronograma(copy);
                                    }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                        <Plus className="w-3 h-3 inline mr-1" />Agregar actividad
                                    </button>
                                </div>
                            </Fragment>
                        ))}
                        <div className="p-2 text-center bg-gray-50">
                            <button type="button" onClick={() => setCronograma([...cronograma, { fecha: '', actividades: [{ hora: '', actividad: '', evaluador: '', referencia: '' }] }])} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                <Plus className="w-3 h-3 inline mr-1" />Agregar fecha
                            </button>
                        </div>
                    </div>
                </div>

                {/* Testificaciones */}
                <div>
                    <div className={seccionCls}>TESTIFICACIONES A REALIZARSE</div>
                    <div className="border border-t-0 border-gray-300 rounded-b overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                            <div className="col-span-1 px-3 py-2">Test</div>
                            <div className="col-span-3 px-3 py-2">Método de ensayo</div>
                            <div className="col-span-3 px-3 py-2">Método/Magnitud</div>
                            <div className="col-span-3 px-3 py-2">Muestra instrumental</div>
                            <div className="col-span-1 px-3 py-2">Evaluador</div>
                            <div className="col-span-1 px-3 py-2 text-center"></div>
                        </div>
                        {testificaciones.map((t, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-12 border-b border-gray-200 last:border-b-0 gap-2 p-2 md:gap-0 md:p-0">
                                <div className="col-span-1 p-1">
                                    <input type="text" value={t.test} readOnly className={`${inputCls} bg-gray-100 text-gray-700 cursor-not-allowed`} />
                                </div>
                                <div className="col-span-3 p-1">
                                    <input type="text" value={t.metodo_ensayo} onChange={e => { const copy = [...testificaciones]; copy[i].metodo_ensayo = e.target.value; setTestificaciones(copy); }} className={inputCls} placeholder="CA7.P1" />
                                </div>
                                <div className="col-span-3 p-1">
                                    <AutoGrowTextarea value={t.metodo_magnitud} onChange={e => { const copy = [...testificaciones]; copy[i].metodo_magnitud = e.target.value; setTestificaciones(copy); }} rows={2} className={textareaCls} placeholder="Tiempo y Frecuencia: Intervalo de Tiempo" />
                                </div>
                                <div className="col-span-3 p-1">
                                    <input type="text" value={t.muestra} onChange={e => { const copy = [...testificaciones]; copy[i].muestra = e.target.value; setTestificaciones(copy); }} className={inputCls} placeholder="Cronómetro" />
                                </div>
                                <div className="col-span-1 p-1">
                                    <input type="text" value={t.evaluador} onChange={e => { const copy = [...testificaciones]; copy[i].evaluador = e.target.value; setTestificaciones(copy); }} className={inputCls} placeholder="ET1" />
                                </div>
                                <div className="col-span-1 p-1 flex items-center justify-center">
                                    <button type="button" onClick={() => setTestificaciones(renumerarTestificaciones(testificaciones.filter((_, idx) => idx !== i)))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        <div className="p-2 text-center bg-gray-50">
                            <button type="button" onClick={() => setTestificaciones(renumerarTestificaciones([...testificaciones, { test: '', metodo_ensayo: '', metodo_magnitud: '', muestra: '', evaluador: '' }]))} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                <Plus className="w-3 h-3 inline mr-1" />Agregar testificación
                            </button>
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <div className={seccionCls}>OBSERVACIONES</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <AutoGrowTextarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} className={textareaCls} />
                    </div>
                </div>

                {/* Planificación */}
                <div>
                    <div className={seccionCls}>PLANIFICACIÓN</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-4">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                {archivo ? archivo.name : 'Seleccionar archivo'}
                                <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                            </label>
                            {archivo && (
                                <button type="button" onClick={() => setArchivo(null)} className="text-xs text-red-600 hover:text-red-800">Quitar</button>
                            )}
                            {!archivo && archivoActual && (
                                <a href={`${BACKEND_URL}${archivoActual}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">Ver archivo actual</a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => navigate('/calidad/auditorias')} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Save className="w-4 h-4" /> {loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Programa de Auditoría')}
                    </button>
                </div>
            </form>
        </div>
    );
};
