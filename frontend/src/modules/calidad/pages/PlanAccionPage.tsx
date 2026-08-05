import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Eye, Pencil, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@sd-vk/spa-quill-table-better';
import '@sd-vk/spa-quill-table-better/dist/quill-table-better.css';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
};

const modules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['table-better'],
        ['clean']
    ]
};

const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet',
    'link',
    'table-better'
];

export const PlanAccionPage = () => {
    const { auditoriaId, ncId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [planAccionExists, setPlanAccionExists] = useState(false);
    const [editing, setEditing] = useState(searchParams.get('editar') === '1');

    const [analisisExtension, setAnalisisExtension] = useState('');
    const [obExtension, setObExtension] = useState('');
    const [causaRaiz, setCausaRaiz] = useState('');

    const [analisisCausa, setAnalisisCausa] = useState('');
    const [obCausa, setObCausa] = useState('');

    const [correcciones, setCorrecciones] = useState([
        { correccion: '', evidencia: '', fecha: '', observaciones: '', ob: '' },
    ]);
    const [correccionFile, setCorreccionFile] = useState<File | null>(null);
    const [planArchivoActual, setPlanArchivoActual] = useState<string | null>(null);
    const [accionesCorrectivas, setAccionesCorrectivas] = useState([
        { accion: '', evidencia: '', fecha: '', observaciones: '', ob: '' },
    ]);

    useEffect(() => {
        const fetchPlanAccion = async () => {
            try {
                const res = await api.get(`/calidad/no-conformidades/${ncId}`);
                const nc = res.data;
                const pa = nc.plan_accion;
                if (pa) {
                    setPlanAccionExists(true);
                    setAnalisisExtension(pa.analisisExtension || '');
                    setObExtension(pa.obExtension || '');
                    setAnalisisCausa(pa.analisisCausa || '');
                    setObCausa(pa.obCausa || '');
                    setCausaRaiz(pa.causaRaiz || '');
                    if (pa.correcciones && pa.correcciones.length > 0) setCorrecciones(pa.correcciones);
                    if (pa.accionesCorrectivas && pa.accionesCorrectivas.length > 0) setAccionesCorrectivas(pa.accionesCorrectivas);
                    if (pa.archivo) setPlanArchivoActual(pa.archivo);
                }
            } catch (error) {
                console.error('Error cargando plan de acción', error);
            } finally {
                setFetching(false);
            }
        };
        fetchPlanAccion();
    }, [ncId]);

    const addCorreccion = () => setCorrecciones([...correcciones, { correccion: '', evidencia: '', fecha: '', observaciones: '', ob: '' }]);
    const removeCorreccion = (i: number) => setCorrecciones(correcciones.filter((_, idx) => idx !== i));
    const updateCorreccion = (i: number, field: string, value: string) => {
        const copy = [...correcciones]; (copy[i] as any)[field] = value; setCorrecciones(copy);
    };

    const addAccion = () => setAccionesCorrectivas([...accionesCorrectivas, { accion: '', evidencia: '', fecha: '', observaciones: '', ob: '' }]);
    const removeAccion = (i: number) => setAccionesCorrectivas(accionesCorrectivas.filter((_, idx) => idx !== i));
    const updateAccion = (i: number, field: string, value: string) => {
        const copy = [...accionesCorrectivas]; (copy[i] as any)[field] = value; setAccionesCorrectivas(copy);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('plan_accion', JSON.stringify({ analisisExtension, obExtension, analisisCausa, obCausa, causaRaiz, correcciones, accionesCorrectivas }));
            if (correccionFile) fd.append('plan_accion_archivo', correccionFile);
            await api.patch(`/calidad/no-conformidades/${ncId}`, fd);
            toast({ message: 'Plan de acción guardado correctamente.' });
            navigate(auditoriaId ? `/calidad/auditorias/${auditoriaId}/nc/${ncId}` : `/calidad/no-conformidades/${ncId}`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar el plan de acción';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    const readOnly = planAccionExists && !editing;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(auditoriaId ? `/calidad/auditorias/${auditoriaId}/nc/${ncId}` : `/calidad/no-conformidades/${ncId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver a la NC
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Plan de Acción</h1>
                <p className="text-sm text-gray-500">Correcciones y Acciones Correctivas propuestas por el OEC</p>
            </div>

            {readOnly && (
                <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm text-blue-800 font-medium">Este plan de acción ya fue guardado y se muestra en modo solo lectura.</span>
                    <button type="button" onClick={() => setEditing(true)} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                        <Pencil className="w-3 h-3" /> Editar
                    </button>
                </div>
            )}

            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${readOnly ? 'read-only' : ''}`}>
                <p className="font-bold text-sm text-gray-800 mb-4">
                    a. <u>Plan de Acción: Correcciones y Acciones Correctivas propuestas por el OEC y revisadas por el Equipo Evaluador del SAE. (ver instrucciones del literal a)</u>
                </p>

                {/* No. NC */}
                <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-500">No. NC: <span className="text-gray-800">{ncId}</span></span>
                </div>

                {/* Análisis de Extensión */}
                <div className="border border-gray-300 rounded mb-4">
                    <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
                        <div className="col-span-10 px-3 py-2 text-xs font-bold text-gray-700">Análisis de Extensión</div>
                        <div className="col-span-2 px-3 py-2 text-xs font-bold text-gray-700 text-center">Ob.</div>
                    </div>
                    <div className="grid grid-cols-12">
                        <div className="col-span-10 p-3 border-r border-gray-200">
                            <ReactQuill
                                theme="snow"
                                value={analisisExtension}
                                onChange={setAnalisisExtension}
                                modules={modules}
                                formats={formats}
                                placeholder="Describa el análisis de extensión..."
                                className="text-sm plan-accion-editor"
                                style={{ minHeight: 100 }}
                                readOnly={readOnly}
                            />
                        </div>
                        <div className="col-span-2 p-3 border-l border-gray-200">
                            <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={obExtension} onChange={e => setObExtension(e.target.value)} onInput={autoResize} placeholder="Ob." readOnly={readOnly} />
                        </div>
                    </div>
                </div>

                {/* Análisis de Causa */}
                <div className="border border-gray-300 rounded mb-4">
                    <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
                        <div className="col-span-10 px-3 py-2 text-xs font-bold text-gray-700">Análisis de Causa</div>
                        <div className="col-span-2 px-3 py-2 text-xs font-bold text-gray-700 text-center">Ob.</div>
                    </div>
                    <div className="grid grid-cols-12">
                        <div className="col-span-10 p-3 border-r border-gray-200">
                            <ReactQuill
                                theme="snow"
                                value={analisisCausa}
                                onChange={setAnalisisCausa}
                                modules={modules}
                                formats={formats}
                                placeholder="Escriba el análisis de causa..."
                                className="text-sm plan-accion-editor"
                                style={{ minHeight: 100 }}
                                readOnly={readOnly}
                            />
                        </div>
                        <div className="col-span-2 p-3 border-l border-gray-200">
                            <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={obCausa} onChange={e => setObCausa(e.target.value)} onInput={autoResize} placeholder="Ob." readOnly={readOnly} />
                        </div>
                    </div>
                </div>

                {/* Causa Raíz */}
                <div className="mb-4">
                    <div className="bg-gray-100 border border-gray-300 rounded-t px-3 py-2 text-xs font-bold text-gray-700">Causa Raíz:</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-3">
                        <ReactQuill
                            theme="snow"
                            value={causaRaiz}
                            onChange={setCausaRaiz}
                            modules={modules}
                            formats={formats}
                            placeholder="Describa la causa raíz..."
                            className="text-sm plan-accion-editor"
                            style={{ minHeight: 100 }}
                            readOnly={readOnly}
                        />
                    </div>
                </div>

                {/* Tabla Correcciones */}
                <div className="border border-gray-300 rounded mb-4 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                        <div className="col-span-3 px-3 py-2">Corrección</div>
                        <div className="col-span-3 px-3 py-2">Evidencia/s a presentar</div>
                        <div className="col-span-2 px-3 py-2">Fecha Implementación</div>
                        <div className="col-span-2 px-3 py-2">Observaciones SAE</div>
                        <div className="col-span-2 px-3 py-2 text-center">Ob.</div>
                    </div>
                    {correcciones.map((c, i) => (
                        <div key={i} className="grid grid-cols-12 border-b border-gray-200 last:border-b-0">
                            <div className="col-span-3 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={c.correccion} onChange={e => updateCorreccion(i, 'correccion', e.target.value)} onInput={autoResize} placeholder="Describa la corrección..." readOnly={readOnly} />
                            </div>
                            <div className="col-span-3 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={c.evidencia} onChange={e => updateCorreccion(i, 'evidencia', e.target.value)} onInput={autoResize} placeholder="Evidencia a presentar..." readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-r border-gray-200">
                                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={c.fecha} onChange={e => updateCorreccion(i, 'fecha', e.target.value)} readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={c.observaciones} onChange={e => updateCorreccion(i, 'observaciones', e.target.value)} onInput={autoResize} placeholder="Sin observaciones" readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-l border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={c.ob} onChange={e => updateCorreccion(i, 'ob', e.target.value)} onInput={autoResize} placeholder="Ob." readOnly={readOnly} />
                                {!readOnly && correcciones.length > 1 && (
                                    <button type="button" onClick={() => removeCorreccion(i)} className="text-red-500 hover:text-red-700 mt-1"><Trash2 className="w-3 h-3" /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="p-2 text-center bg-gray-50">
                        {!readOnly && <button type="button" onClick={addCorreccion} className="text-xs text-blue-600 hover:text-blue-800 font-medium"><Plus className="w-3 h-3 inline mr-1" />Agregar Corrección</button>}
                    </div>
                </div>

                {/* Tabla Acciones Correctivas */}
                <div className="border border-gray-300 rounded overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                        <div className="col-span-3 px-3 py-2">Acción Correctiva</div>
                        <div className="col-span-3 px-3 py-2">Evidencia/s a presentar</div>
                        <div className="col-span-2 px-3 py-2">Fecha Implementación</div>
                        <div className="col-span-2 px-3 py-2">Observaciones SAE</div>
                        <div className="col-span-2 px-3 py-2 text-center">Ob.</div>
                    </div>
                    {accionesCorrectivas.map((a, i) => (
                        <div key={i} className="grid grid-cols-12 border-b border-gray-200 last:border-b-0">
                            <div className="col-span-3 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={a.accion} onChange={e => updateAccion(i, 'accion', e.target.value)} onInput={autoResize} placeholder="Describa la acción correctiva..." readOnly={readOnly} />
                            </div>
                            <div className="col-span-3 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={a.evidencia} onChange={e => updateAccion(i, 'evidencia', e.target.value)} onInput={autoResize} placeholder="Evidencia a presentar..." readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-r border-gray-200">
                                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={a.fecha} onChange={e => updateAccion(i, 'fecha', e.target.value)} readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-r border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={a.observaciones} onChange={e => updateAccion(i, 'observaciones', e.target.value)} onInput={autoResize} placeholder="Sin observaciones" readOnly={readOnly} />
                            </div>
                            <div className="col-span-2 p-2 border-l border-gray-200">
                                <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" value={a.ob} onChange={e => updateAccion(i, 'ob', e.target.value)} onInput={autoResize} placeholder="Ob." readOnly={readOnly} />
                                {!readOnly && accionesCorrectivas.length > 1 && (
                                    <button type="button" onClick={() => removeAccion(i)} className="text-red-500 hover:text-red-700 mt-1"><Trash2 className="w-3 h-3" /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="p-2 text-center bg-gray-50">
                        {!readOnly && <button type="button" onClick={addAccion} className="text-xs text-blue-600 hover:text-blue-800 font-medium"><Plus className="w-3 h-3 inline mr-1" />Agregar Acción Correctiva</button>}
                    </div>
                </div>

                {/* Archivo adjunto */}
                {!readOnly && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Adjuntar archivo (Correcciones):</label>
                        <input type="file" accept=".xlsx,.xls,.pdf,.doc,.docx" className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setCorreccionFile(e.target.files?.[0] || null)} />
                        {correccionFile ? (
                            <p className="text-xs text-gray-500 mt-1">Seleccionado: {correccionFile.name}</p>
                        ) : planArchivoActual ? (
                            <a href={`${BACKEND_URL}${planArchivoActual}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block">Ver archivo actual</a>
                        ) : null}
                    </div>
                )}

                {readOnly && planArchivoActual && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Archivo adjunto (Plan de Acción):</div>
                        <a href={`${BACKEND_URL}${planArchivoActual}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Ver/descargar archivo</a>
                    </div>
                )}

                <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                    {!readOnly && (
                        <>
                            {planAccionExists && (
                                <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 mr-2">
                                    <X className="w-4 h-4" /> Cancelar
                                </button>
                            )}
                            <button type="button" onClick={handleSave} disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                                <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar Plan de Acción'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};