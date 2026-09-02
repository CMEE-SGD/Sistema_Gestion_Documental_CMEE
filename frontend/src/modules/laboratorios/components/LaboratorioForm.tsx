// src/modules/laboratorios/components/LaboratorioForm.tsx
import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface LaboratorioFormProps {
    laboratorioId?: number | null; // Si viene ID, es edición. Si es null, es creación.
    onClose: () => void;
    onSuccess: () => void;
}

const PALABRAS_IGNORADAS = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'EL']);

/** Deriva un código corto y en mayúsculas a partir del nombre del departamento
 * (ej. "Departamento de Termometría" -> "DEP-TERMOMETRIA"), respetando el
 * límite de 20 caracteres de la columna. Es solo un valor por defecto — el
 * campo Código sigue siendo editable por si hay que resolver un choque. */
function generarCodigoDesdeNombre(nombre: string): string {
    const sinTildes = nombre
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '');

    const palabras = sinTildes.split(/\s+/).filter((p) => p && !PALABRAS_IGNORADAS.has(p));
    if (palabras.length === 0) return '';

    const base = palabras.join('-').slice(0, 16);
    return `DEP-${base}`;
}

function extraerMensajeError(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const data = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (data?.message) return data.message;
    }
    return fallback;
}

export const LaboratorioForm = ({ laboratorioId, onClose, onSuccess }: LaboratorioFormProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        responsable_id: ''
    });
    const [departamentos, setDepartamentos] = useState<{ id: number; codigo: string; nombre: string }[]>([]);
    const [departamentosDisponibles, setDepartamentosDisponibles] = useState<{ id: number; codigo: string; nombre: string }[]>([]);
    const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState('');
    const [modoCrearNuevoDepartamento, setModoCrearNuevoDepartamento] = useState(false);
    const [nuevoDepartamento, setNuevoDepartamento] = useState({ codigo: '', nombre: '' });
    const [codigoDepartamentoEditadoManualmente, setCodigoDepartamentoEditadoManualmente] = useState(false);
    const [guardandoDepartamento, setGuardandoDepartamento] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const resPersonas = await api.get('/laboratorios/candidatos-responsable', {
                    params: laboratorioId ? { laboratorioId } : undefined,
                });
                setPersonas(resPersonas.data);

                const resDisponibles = await api.get('/laboratorios/departamentos-disponibles');
                setDepartamentosDisponibles(resDisponibles.data);

                // Si hay ID, cargamos los datos para editar
                if (laboratorioId) {
                    const resLab = await api.get(`/laboratorios/${laboratorioId}`);
                    const lab = resLab.data;
                    setFormData({
                        codigo: lab.codigo || '',
                        nombre: lab.nombre || '',
                        descripcion: lab.descripcion || '',
                        responsable_id: lab.responsable_id?.toString() || ''
                    });

                    const resDepartamentos = await api.get(`/laboratorios/${laboratorioId}/departamentos`);
                    setDepartamentos(resDepartamentos.data);
                }
            } catch (error) {
                console.error('Error al cargar datos', error);
                await alert({ title: 'Error', message: 'No se pudo cargar la información requerida.' });
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [laboratorioId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNombreDepartamentoChange = (nombre: string) => {
        setNuevoDepartamento(prev => ({
            ...prev,
            nombre,
            // Mientras el usuario no toque el código a mano, se recalcula solo.
            codigo: codigoDepartamentoEditadoManualmente ? prev.codigo : generarCodigoDesdeNombre(nombre),
        }));
    };

    const handleCodigoDepartamentoChange = (codigo: string) => {
        setCodigoDepartamentoEditadoManualmente(true);
        setNuevoDepartamento(prev => ({ ...prev, codigo }));
    };

    // Vincula un departamento que ya existe en el organigrama (RRHH > Grupos)
    // — la vía preferida, para no crear duplicados de algo que ya está ahí.
    const vincularExistente = async (idLaboratorio: number, departamentoId: number) => {
        const res = await api.patch(`/laboratorios/${idLaboratorio}/departamentos/${departamentoId}`);
        setDepartamentos(prev => [...prev, res.data]);
        setDepartamentosDisponibles(prev => prev.filter(d => d.id !== departamentoId));
        setDepartamentoSeleccionadoId('');
    };

    // Respaldo para cuando de verdad no existe todavía ningún departamento
    // apropiado — crea uno nuevo ya enlazado.
    const crearYVincularDepartamento = async (idLaboratorio: number) => {
        const res = await api.post(`/laboratorios/${idLaboratorio}/departamentos`, {
            codigo: nuevoDepartamento.codigo.trim(),
            nombre: nuevoDepartamento.nombre.trim(),
        });
        setDepartamentos(prev => [...prev, res.data]);
        setNuevoDepartamento({ codigo: '', nombre: '' });
        setCodigoDepartamentoEditadoManualmente(false);
    };

    // Solo se usa en modo edición (ya existe laboratorioId) — vincula al instante,
    // independiente del botón "Guardar Laboratorio".
    const handleVincularDepartamento = async () => {
        if (!laboratorioId) return;
        if (modoCrearNuevoDepartamento) {
            if (!nuevoDepartamento.codigo.trim() || !nuevoDepartamento.nombre.trim()) {
                await alert({ title: 'Datos incompletos', message: 'Ingresa el nombre del nuevo departamento (el código se autocompleta).' });
                return;
            }
        } else if (!departamentoSeleccionadoId) {
            await alert({ title: 'Datos incompletos', message: 'Selecciona un departamento de la lista.' });
            return;
        }
        setGuardandoDepartamento(true);
        try {
            if (modoCrearNuevoDepartamento) {
                await crearYVincularDepartamento(laboratorioId);
            } else {
                await vincularExistente(laboratorioId, Number(departamentoSeleccionadoId));
            }
            toast({ message: 'Departamento vinculado. Ya puedes asignarle puestos desde RRHH.' });
        } catch (error) {
            const mensaje = extraerMensajeError(error, 'No se pudo vincular el departamento.');
            await alert({ title: 'Error', message: mensaje });
        } finally {
            setGuardandoDepartamento(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                codigo: formData.codigo,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : null
            };

            let idLaboratorio = laboratorioId;
            if (laboratorioId) {
                await api.patch(`/laboratorios/${laboratorioId}`, payload);
            } else {
                const resNuevo = await api.post('/laboratorios', payload);
                idLaboratorio = resNuevo.data.id;
            }

            // Solo en modo creación: en edición, vincular ya es una acción aparte
            // (handleVincularDepartamento) para no duplicar la llamada.
            if (!laboratorioId && idLaboratorio) {
                const debeVincular = modoCrearNuevoDepartamento
                    ? Boolean(nuevoDepartamento.codigo.trim() && nuevoDepartamento.nombre.trim())
                    : Boolean(departamentoSeleccionadoId);

                if (debeVincular) {
                    try {
                        if (modoCrearNuevoDepartamento) {
                            await crearYVincularDepartamento(idLaboratorio);
                        } else {
                            await vincularExistente(idLaboratorio, Number(departamentoSeleccionadoId));
                        }
                    } catch (errorDepartamento) {
                        const mensaje = extraerMensajeError(
                            errorDepartamento,
                            'El laboratorio se guardó, pero no se pudo vincular el departamento. Puedes intentarlo de nuevo editando el laboratorio.',
                        );
                        await alert({ title: 'Aviso', message: mensaje });
                    }
                }
            }

            toast({ message: laboratorioId ? 'Laboratorio actualizado exitosamente.' : 'Laboratorio registrado exitosamente.' });
            onSuccess(); // Actualizar tabla
            onClose(); // Cerrar modal
        } catch (error) {
            console.error('Error al guardar laboratorio', error);
            await alert({ title: 'Error', message: 'Ocurrió un error al guardar los cambios.' });
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500">Cargando formulario...</div>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Código interno</label>
                    <input 
                        type="text" name="codigo" value={formData.codigo} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: LAB-MASA-01" 
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nombre del Laboratorio <span className="text-red-500">*</span></label>
                    <input 
                        type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: Laboratorio de Masa" 
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Responsable Técnico</label>
                <select 
                    name="responsable_id" value={formData.responsable_id} onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                    <option value="">-- Sin asignar --</option>
                    {personas.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellidos} {p.codigo ? `(${p.codigo})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5 border border-gray-200 rounded-md p-3 bg-gray-50">
                <label className="text-sm font-medium text-gray-700">Departamento(s) vinculado(s)</label>

                {departamentos.length > 0 && (
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                        {departamentos.map(d => (
                            <li key={d.id}>{d.nombre} ({d.codigo})</li>
                        ))}
                    </ul>
                )}

                {/* En edición siempre se puede vincular otro departamento más —
                    útil para laboratorios que internamente se dividen en más de
                    una sub-área (cada una con su propio responsable). En
                    creación solo se pre-selecciona uno, que se vincula al
                    guardar; los demás se agregan luego editando. */}
                {(!laboratorioId || departamentos.length === 0) && (
                    <p className="text-xs text-gray-500">
                        Un laboratorio solo puede tener Responsable Técnico y usuarios (Observador Técnico, etc.)
                        a través de un Departamento vinculado a él — sin esto, las personas que asignes en RRHH
                        no quedarán asociadas a este laboratorio.
                    </p>
                )}
                {laboratorioId && departamentos.length === 0 && (
                    <p className="text-xs text-amber-600">Este laboratorio todavía no tiene ningún departamento vinculado.</p>
                )}

                <>
                        {!modoCrearNuevoDepartamento ? (
                            <div className="flex flex-wrap items-end gap-2 mt-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Departamento existente</label>
                                    <select
                                        value={departamentoSeleccionadoId}
                                        onChange={(e) => setDepartamentoSeleccionadoId(e.target.value)}
                                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-64 bg-white"
                                    >
                                        <option value="">-- Selecciona --</option>
                                        {departamentosDisponibles.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Código</label>
                                    <input
                                        type="text" readOnly disabled
                                        value={departamentosDisponibles.find(d => d.id === Number(departamentoSeleccionadoId))?.codigo ?? ''}
                                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-28 bg-gray-100 text-gray-500"
                                        placeholder="—"
                                    />
                                </div>
                                {laboratorioId && (
                                    <Button type="button" variant="outline" onClick={handleVincularDepartamento} disabled={guardandoDepartamento}>
                                        {guardandoDepartamento ? 'Vinculando...' : '+ Vincular departamento'}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-end gap-2 mt-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Nombre del nuevo departamento</label>
                                    <input
                                        type="text" value={nuevoDepartamento.nombre}
                                        onChange={(e) => handleNombreDepartamentoChange(e.target.value)}
                                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-56"
                                        placeholder="Ej: Departamento de Termometría"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-600">Código</label>
                                    <input
                                        type="text" value={nuevoDepartamento.codigo}
                                        onChange={(e) => handleCodigoDepartamentoChange(e.target.value)}
                                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-32"
                                        placeholder="Se autocompleta"
                                    />
                                </div>
                                {laboratorioId && (
                                    <Button type="button" variant="outline" onClick={handleVincularDepartamento} disabled={guardandoDepartamento}>
                                        {guardandoDepartamento ? 'Vinculando...' : '+ Vincular departamento'}
                                    </Button>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setModoCrearNuevoDepartamento(prev => !prev)}
                            className="text-xs text-blue-600 hover:underline self-start mt-1"
                        >
                            {modoCrearNuevoDepartamento ? '‹ Elegir uno existente' : '¿No existe? + Crear uno nuevo'}
                        </button>

                        {!laboratorioId && (
                            <p className="text-xs text-gray-500">
                                Se vinculará automáticamente al guardar este laboratorio (déjalo sin seleccionar si no quieres vincular uno todavía).
                            </p>
                        )}
                </>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Descripción General</label>
                <textarea 
                    name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" 
                    placeholder="Describa áreas de calibración o alcance..." 
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                <Button variant="default" type="submit">Guardar Laboratorio</Button>
            </div>
        </form>
    );
};