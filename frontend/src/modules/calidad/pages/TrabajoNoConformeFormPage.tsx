import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../shared/utils/ids';
import { ACCIONES_TOMADAS, CATEGORIAS, hoy } from './trabajosNoConformes';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'text-sm font-medium text-gray-700';

const Seccion = ({ titulo, color, children }: { titulo: string; color: string; children: React.ReactNode }) => (
    <>
        <div className={`${color} text-white px-4 py-3 text-sm font-semibold`}>{titulo}</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </>
);

const SiNo = ({ valor, onChange, name }: { valor: boolean | '' | 'true' | 'false'; onChange: (v: 'true' | 'false') => void; name: string }) => (
    <div className="flex gap-4 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="radio"
                name={name}
                checked={valor === 'true'}
                onChange={() => onChange('true')}
                className="w-4 h-4 text-emerald-600"
            />
            <span className="text-sm text-gray-700">Sí</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="radio"
                name={name}
                checked={valor === 'false'}
                onChange={() => onChange('false')}
                className="w-4 h-4 text-red-600"
            />
            <span className="text-sm text-gray-700">No</span>
        </label>
    </div>
);

const estadoVacio = () => ({
    elaborado_por: '',
    fecha: hoy(),
    categoria: 'EQUIPO',
    descripcion_problema: '',
    tratamiento_responsable: '',
    tratamiento_fecha: '',
    acciones: [] as string[],
    tratamiento_descripcion: '',
    requiere_accion_correctiva: 'false' as 'true' | 'false',
    accion_correctiva_num: '',
    requiere_accion_preventiva: 'false' as 'true' | 'false',
    accion_preventiva_num: '',
    seguimiento_responsable: '',
    seguimiento_fecha: '',
    eficaz: '' as '' | 'true' | 'false',
    eficacia_verificada: '',
    observaciones: '',
    cerrado_por: '',
    fecha_cierre: '',
});

export const TrabajoNoConformeFormPage = () => {
    const { id: rawId } = useParams<{ id: string }>();
    const id = rawId ? decodeId(rawId) : undefined;
    const navigate = useNavigate();
    const { alert, pedirMotivo } = useAlert();
    const { toast } = useToast();
    const esEdicion = !!id;
    const [loading, setLoading] = useState(esEdicion);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState(estadoVacio());

    useEffect(() => {
        if (!esEdicion) return;
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/trabajos-no-conformes/${id}`);
                const r = res.data;
                setForm({
                    elaborado_por: r.elaborado_por || '',
                    fecha: r.fecha ? r.fecha.slice(0, 10) : '',
                    categoria: r.categoria || 'EQUIPO',
                    descripcion_problema: r.descripcion_problema || '',
                    tratamiento_responsable: r.tratamiento_responsable || '',
                    tratamiento_fecha: r.tratamiento_fecha ? r.tratamiento_fecha.slice(0, 10) : '',
                    acciones: Array.isArray(r.acciones_tomadas) ? r.acciones_tomadas : [],
                    tratamiento_descripcion: r.tratamiento_descripcion || '',
                    requiere_accion_correctiva: r.requiere_accion_correctiva ? 'true' : 'false',
                    accion_correctiva_num: r.accion_correctiva_num || '',
                    requiere_accion_preventiva: r.requiere_accion_preventiva ? 'true' : 'false',
                    accion_preventiva_num: r.accion_preventiva_num || '',
                    seguimiento_responsable: r.seguimiento_responsable || '',
                    seguimiento_fecha: r.seguimiento_fecha ? r.seguimiento_fecha.slice(0, 10) : '',
                    eficaz: r.eficaz === true ? 'true' : r.eficaz === false ? 'false' : '',
                    eficacia_verificada: r.eficacia_verificada || '',
                    observaciones: r.observaciones || '',
                    cerrado_por: r.cerrado_por || '',
                    fecha_cierre: r.fecha_cierre ? r.fecha_cierre.slice(0, 10) : '',
                });
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
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleAccion = (valor: string) =>
        setForm((prev) => ({
            ...prev,
            acciones: prev.acciones.includes(valor)
                ? prev.acciones.filter((a) => a !== valor)
                : [...prev.acciones, valor],
        }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const payload: any = {
                elaborado_por: form.elaborado_por,
                fecha: form.fecha || null,
                categoria: form.categoria,
                descripcion_problema: form.descripcion_problema,
                tratamiento_responsable: form.tratamiento_responsable || null,
                tratamiento_fecha: form.tratamiento_fecha || null,
                acciones_tomadas: form.acciones,
                tratamiento_descripcion: form.tratamiento_descripcion || null,
                requiere_accion_correctiva: form.requiere_accion_correctiva === 'true',
                accion_correctiva_num: form.accion_correctiva_num || null,
                requiere_accion_preventiva: form.requiere_accion_preventiva === 'true',
                accion_preventiva_num: form.accion_preventiva_num || null,
                seguimiento_responsable: form.seguimiento_responsable || null,
                seguimiento_fecha: form.seguimiento_fecha || null,
                eficaz: form.eficaz === '' ? null : form.eficaz === 'true',
                eficacia_verificada: form.eficacia_verificada || null,
                observaciones: form.observaciones || null,
                cerrado_por: form.cerrado_por || null,
                fecha_cierre: form.fecha_cierre || null,
            };

            if (esEdicion) {
                const motivo = await pedirMotivo({
                    title: 'Guardar cambios',
                    message: 'Va a modificar este trabajo no conforme.',
                    confirmLabel: 'Guardar',
                });
                if (!motivo) return;
                await api.patch(`/calidad/trabajos-no-conformes/${id}`, payload, { motivo });
                toast({ message: 'Registro actualizado correctamente.' });
            } else {
                await api.post('/calidad/trabajos-no-conformes', payload);
                toast({ message: 'Trabajo no conforme registrado correctamente.' });
            }
            navigate('/calidad/trabajos-no-conformes');
        } catch (error: any) {
            await alert({ message: error?.response?.data?.message || 'Error al guardar el registro.' });
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Cargando...</div>;

    return (
        <div>
            <button
                onClick={() => navigate('/calidad/trabajos-no-conformes')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a Trabajos No Conformes
            </button>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* ============ 1. DESCRIPCIÓN ============ */}
                <Seccion titulo="1. DESCRIPCIÓN DEL ENSAYO Y/O CALIBRACIÓN NO CONFORME" color="bg-[#88bddf]">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Elaborado / Detectado por</label>
                        <input
                            type="text"
                            name="elaborado_por"
                            value={form.elaborado_por}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Nombres y grado/cargo de quien detecta"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Fecha de detección</label>
                        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Categoría</label>
                        <select name="categoria" value={form.categoria} onChange={handleChange} className={`${inputCls} bg-white`}>
                            {CATEGORIAS.map((c) => (
                                <option key={c.valor} value={c.valor}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className={labelCls}>Descripción del problema</label>
                        <textarea
                            name="descripcion_problema"
                            value={form.descripcion_problema}
                            onChange={handleChange}
                            rows={5}
                            className={inputCls}
                            placeholder="Describa el ensayo o calibración no conforme, el equipo utilizado y el resultado obtenido..."
                            required
                        />
                    </div>
                </Seccion>

                {/* ============ 2. TRATAMIENTO ============ */}
                <Seccion titulo="2. TRATAMIENTO DEL ENSAYO Y/O CALIBRACIÓN NO CONFORME" color="bg-amber-500">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Responsable</label>
                        <input
                            type="text"
                            name="tratamiento_responsable"
                            value={form.tratamiento_responsable}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Nombres y cargo del responsable"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Fecha</label>
                        <input
                            type="date"
                            name="tratamiento_fecha"
                            value={form.tratamiento_fecha}
                            onChange={handleChange}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className={labelCls}>Acciones tomadas</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                            {ACCIONES_TOMADAS.map((a) => (
                                <label key={a.valor} className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={form.acciones.includes(a.valor)}
                                        onChange={() => toggleAccion(a.valor)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">{a.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className={labelCls}>Descripción del tratamiento</label>
                        <textarea
                            name="tratamiento_descripcion"
                            value={form.tratamiento_descripcion}
                            onChange={handleChange}
                            rows={4}
                            className={inputCls}
                            placeholder="Detalle las medidas tomadas sobre el ensayo o calibración no conforme..."
                        />
                    </div>
                </Seccion>

                {/* ============ 3. ACCIÓN CORRECTIVA / PREVENTIVA ============ */}
                <Seccion titulo="3. REQUIERE ACCIÓN CORRECTIVA / PREVENTIVA" color="bg-blue-500">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>¿Requiere acción correctiva?</label>
                        <SiNo
                            name="requiere_accion_correctiva"
                            valor={form.requiere_accion_correctiva}
                            onChange={(v) => setForm((prev) => ({ ...prev, requiere_accion_correctiva: v }))}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>N° de acción correctiva</label>
                        <input
                            type="text"
                            name="accion_correctiva_num"
                            value={form.accion_correctiva_num}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Ej: IAC-2026-001 (si aplica)"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>¿Requiere acción preventiva?</label>
                        <SiNo
                            name="requiere_accion_preventiva"
                            valor={form.requiere_accion_preventiva}
                            onChange={(v) => setForm((prev) => ({ ...prev, requiere_accion_preventiva: v }))}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>N° de acción preventiva</label>
                        <input
                            type="text"
                            name="accion_preventiva_num"
                            value={form.accion_preventiva_num}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Ej: IAP-2026-001 (si aplica)"
                        />
                    </div>
                </Seccion>

                {/* ============ 4. SEGUIMIENTO ============ */}
                <Seccion titulo="4. SEGUIMIENTO" color="bg-emerald-500">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Responsable</label>
                        <input
                            type="text"
                            name="seguimiento_responsable"
                            value={form.seguimiento_responsable}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Nombres y cargo del responsable"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Fecha</label>
                        <input
                            type="date"
                            name="seguimiento_fecha"
                            value={form.seguimiento_fecha}
                            onChange={handleChange}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>¿Eficaz?</label>
                        <div className="flex gap-4 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="eficaz"
                                    checked={form.eficaz === 'true'}
                                    onChange={() => setForm((prev) => ({ ...prev, eficaz: 'true' }))}
                                    className="w-4 h-4 text-emerald-600"
                                />
                                <span className="text-sm text-gray-700">Sí</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="eficaz"
                                    checked={form.eficaz === 'false'}
                                    onChange={() => setForm((prev) => ({ ...prev, eficaz: 'false' }))}
                                    className="w-4 h-4 text-red-600"
                                />
                                <span className="text-sm text-gray-700">No</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="eficaz"
                                    checked={form.eficaz === ''}
                                    onChange={() => setForm((prev) => ({ ...prev, eficaz: '' }))}
                                    className="w-4 h-4 text-gray-500"
                                />
                                <span className="text-sm text-gray-500">Pendiente</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className={labelCls}>Eficacia verificada</label>
                        <textarea
                            name="eficacia_verificada"
                            value={form.eficacia_verificada}
                            onChange={handleChange}
                            rows={3}
                            className={inputCls}
                            placeholder="Describa cómo se verificó la eficacia de las acciones tomadas..."
                        />
                    </div>
                </Seccion>

                {/* ============ 5. OBSERVACIONES Y CIERRE ============ */}
                <Seccion titulo="5. OBSERVACIONES Y CIERRE" color="bg-gray-600">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className={labelCls}>Observaciones</label>
                        <textarea
                            name="observaciones"
                            value={form.observaciones}
                            onChange={handleChange}
                            rows={3}
                            className={inputCls}
                            placeholder="Observaciones adicionales..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Nombre de quien cierra</label>
                        <input
                            type="text"
                            name="cerrado_por"
                            value={form.cerrado_por}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Nombres y cargo"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Fecha de cierre</label>
                        <input
                            type="date"
                            name="fecha_cierre"
                            value={form.fecha_cierre}
                            onChange={handleChange}
                            className={inputCls}
                        />
                    </div>
                </Seccion>

                {/* ============ BOTONES ============ */}
                <div className="flex justify-end gap-3 px-4 pb-4 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(esEdicion ? `/calidad/trabajos-no-conformes/${encodeId(id)}` : '/calidad/trabajos-no-conformes')
                        }
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
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
