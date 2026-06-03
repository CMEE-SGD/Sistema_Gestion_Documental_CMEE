import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import api from '../../lib/axios';
import { UserCheck, User } from 'lucide-react';

interface Departamento { id: number; nombre: string; }
interface Puesto { id: number; nombre: string; }
interface Rol { id: number; nombre: string; }

// COMPONENTES AUXILIARES
const InfoIcon = () => (
    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#8eb8d5] to-[#4a84b5] text-white flex items-center justify-center text-[9px] font-bold font-serif shadow-sm shrink-0">
        i
    </div>
);

const LabelRow = ({ label, requerido = false, children, mb = "mb-3" }: any) => (
    <div className={`flex items-start ${mb}`}>
        <div className="w-40 flex items-center gap-1.5 text-[11px] text-gray-800 shrink-0 pt-1">
            <InfoIcon />
            <span>{label} {requerido && <span>*</span>}</span>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

export const EditarPersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fotoFile, setFotoFile] = useState<File | null>(null);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [puestosLista, setPuestosLista] = useState<Puesto[]>([]);
    const [rolesLista, setRolesLista] = useState<Rol[]>([]);

    const [formData, setFormData] = useState({
        codigo: '', saludo: '', nombre: '', apellidos: '',
        cedula_identidad: '', fecha_nacimiento: '', sexo: 'M',
        domicilio: '', ciudad: '', codigo_postal: '', provincia: '',
        telefono: '', fax: '', celular: '', email_1: '', email_2: '',
        activo: true, tipo_recurso: 'Usuario del sistema',
        roles: [] as number[],
        puestos_asignados: [
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' }
        ]
    });

    useEffect(() => {
        const fetchDatosIniciales = async () => {
            try {
                const [resDeptos, resPuestos, resRoles] = await Promise.all([
                    api.get('/departamentos'), api.get('/puestos'), api.get('/roles')
                ]);
                if (Array.isArray(resDeptos.data)) setDepartamentos(resDeptos.data);
                if (Array.isArray(resPuestos.data)) setPuestosLista(resPuestos.data);
                if (Array.isArray(resRoles.data)) setRolesLista(resRoles.data);

                if (id) {
                    const resPersona = await api.get(`/personas/${id}`);
                    const p = resPersona.data;

                    let fechaNac = '';
                    if (p.fecha_nacimiento) {
                        fechaNac = p.fecha_nacimiento.split('T')[0];
                    }

                    const rolesIds = p.roles ? p.roles.map((r: any) => r.id) : [];

                    const puestos = [
                        { departamento_id: '', puesto_id: '' },
                        { departamento_id: '', puesto_id: '' },
                        { departamento_id: '', puesto_id: '' }
                    ];

                    if (p.puestos && Array.isArray(p.puestos)) {
                        p.puestos.forEach((asig: any, index: number) => {
                            if (index < 3) {
                                puestos[index] = {
                                    departamento_id: asig.departamento?.id ? String(asig.departamento.id) : String(asig.departamento_id || ''),
                                    puesto_id: asig.puesto?.id ? String(asig.puesto.id) : String(asig.puesto_id || '')
                                };
                            }
                        });
                    }

                    setFormData({
                        codigo: p.codigo || '',
                        saludo: p.saludo || '',
                        nombre: p.nombre || '',
                        apellidos: p.apellidos || '',
                        cedula_identidad: p.cedula_identidad || '',
                        fecha_nacimiento: fechaNac,
                        sexo: p.sexo || 'M',
                        domicilio: p.domicilio || '',
                        ciudad: p.ciudad || '',
                        codigo_postal: p.codigo_postal || '',
                        provincia: p.provincia || '',
                        telefono: p.telefono || '',
                        fax: p.fax || '',
                        celular: p.celular || '',
                        email_1: p.email_1 || '',
                        email_2: p.email_2 || '',
                        activo: p.activo ?? true,
                        tipo_recurso: p.tipo_recurso || 'Usuario del sistema',
                        roles: rolesIds,
                        puestos_asignados: puestos
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos para edición', error);
            } finally {
                setFetching(false);
            }
        };

        fetchDatosIniciales();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePuestoChange = (index: number, campo: 'departamento_id' | 'puesto_id', valor: string) => {
        const nuevosPuestos = [...formData.puestos_asignados];
        nuevosPuestos[index][campo] = valor;
        setFormData({ ...formData, puestos_asignados: nuevosPuestos });
    };

    const handleRoleToggle = (rolId: number) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(rolId)
                ? prev.roles.filter(id => id !== rolId)
                : [...prev.roles, rolId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();

            // A. Agregamos todos los campos de texto
            Object.keys(formData).forEach((key) => {
                if (key !== 'roles' && key !== 'puestos_asignados' && key !== 'fecha_nacimiento') {
                    formDataToSend.append(key, String(formData[key as keyof typeof formData]));
                }
            });

            // B. Formateamos fecha y arreglos
            if (formData.fecha_nacimiento) {
                formDataToSend.append('fecha_nacimiento', new Date(formData.fecha_nacimiento).toISOString());
            }

            formDataToSend.append('roles', JSON.stringify(formData.roles));

            const puestosValidos = formData.puestos_asignados
                .filter(p => p.departamento_id !== '' && p.puesto_id !== '')
                .map(p => ({
                    departamento_id: Number(p.departamento_id),
                    puesto_id: Number(p.puesto_id)
                }));
            formDataToSend.append('puestos_asignados', JSON.stringify(puestosValidos));

            // C. Si el usuario seleccionó una NUEVA foto, la adjuntamos
            if (fotoFile) {
                formDataToSend.append('foto', fotoFile);
            }

            // D. Enviamos como multipart/form-data usando PATCH
            await api.patch(`/personas/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate(`/rrhh/personas/${id}`);
        } catch (error: any) {
            console.error(error);
            alert(`Error al actualizar: ${JSON.stringify(error.response?.data?.message || 'Error del servidor')}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-[11px] font-sans">Cargando datos del recurso...</div>;
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 text-sm">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">Modificar recurso: {formData.nombre} {formData.apellidos}</span>
            </div>

            <div className="p-4">
                <div className="border border-gray-300">
                    <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs">
                        Modificar recurso
                    </div>

                    <form onSubmit={handleSubmit} className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px]">
                        <div className="p-6">

                            {/* --- DATOS PERSONALES --- */}
                            <h3 className="font-bold text-[12px] mb-4 text-gray-900 underline">Datos personales</h3>

                            <LabelRow label="Código:">
                                <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-40 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Saludo:">
                                <select name="saludo" value={formData.saludo} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-48 bg-white outline-none focus:border-blue-500">
                                    <option value="">Seleccione un saludo</option>
                                    <option value="Sr.">Sr.</option>
                                    <option value="Sra.">Sra.</option>
                                    <option value="Ing.">Ing.</option>
                                    <option value="Lic.">Lic.</option>
                                </select>
                            </LabelRow>

                            <LabelRow label="Nombre:" requerido mb="mb-2">
                                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border-2 border-black px-1.5 py-0.5 w-56 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Apellidos:" requerido>
                                <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-80 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="C.I.:">
                                <input type="text" name="cedula_identidad" value={formData.cedula_identidad} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-40 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Fecha de nacimiento:">
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-32 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Sexo:">
                                <div className="flex items-center gap-4 mt-1">
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sexo" value="M" checked={formData.sexo === 'M'} onChange={handleChange} /> Masculino</label>
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sexo" value="F" checked={formData.sexo === 'F'} onChange={handleChange} /> Femenino</label>
                                </div>
                            </LabelRow>

                            <LabelRow label="Domicilio:">
                                <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-96 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Ciudad:">
                                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-64 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Código postal:">
                                <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-24 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Provincia:">
                                <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-80 bg-white outline-none focus:border-blue-500" />
                            </LabelRow>

                            <LabelRow label="Teléfono:">
                                <div className="flex items-center gap-4">
                                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-24 bg-white outline-none focus:border-blue-500" />
                                    <span>Fax:</span>
                                    <input type="text" name="fax" value={formData.fax} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-24 bg-white outline-none focus:border-blue-500" />
                                    <span>Celular:</span>
                                    <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-24 bg-white outline-none focus:border-blue-500" />
                                </div>
                            </LabelRow>

                            <div className="mt-4">
                                <LabelRow label="E-mail 1:">
                                    <input type="email" name="email_1" value={formData.email_1} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-80 bg-white outline-none focus:border-blue-500" />
                                </LabelRow>
                                <LabelRow label="E-mail 2:">
                                    <input type="email" name="email_2" value={formData.email_2} onChange={handleChange} className="border border-gray-300 px-1.5 py-0.5 w-80 bg-white outline-none focus:border-blue-500" />
                                </LabelRow>
                            </div>

                            <div className="flex items-center gap-2 mt-4 mb-2">
                                <div className="w-40"><img src="https://cdn-icons-png.flaticon.com/128/1374/1374128.png" className="w-4 inline mr-1" alt="img" /> Fotografía:</div>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> Mostrar ampliación en listado</label>
                            </div>
                            <div className="flex items-start gap-2 mb-6">
                                <div className="w-40"><img src="https://cdn-icons-png.flaticon.com/128/711/711186.png" className="w-4 inline mr-1" alt="file" /> Fichero:</div>
                                <div>
                                    {/* 👇 3. ACTUALIZAMOS EL INPUT PARA CAPTURAR LA FOTO */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                                        className="text-[10px]"
                                    />
                                    <div className="text-[9px] mt-1 text-black font-semibold">
                                        Dimensiones recomendadas 61px x 84px. <br />
                                        <span className="text-gray-500 font-normal">(Si sube un archivo nuevo, reemplazará al anterior)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-300 py-3 mb-6 flex items-center">
                                <div className="w-40 font-bold">Hoja de Vida:</div>
                                <input type="text" readOnly placeholder="Ver adjunto" className="border border-gray-300 px-2 py-1 w-96 bg-white outline-none cursor-default" />
                            </div>

                            {/* --- CONDICIONAL DE ESTADO (SOLO APARECE SI ESTÁ INACTIVO) --- */}
                            {!formData.activo && (
                                <LabelRow label="Estado del recurso:">
                                    <label className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer font-bold text-red-600 bg-red-50 p-1 w-max rounded border border-red-200">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleChange}
                                            className="w-3.5 h-3.5 cursor-pointer"
                                        />
                                        Marcar para volver a Activar recurso en el sistema
                                    </label>
                                </LabelRow>
                            )}

                            {/* --- PUESTOS --- */}
                            <h3 className="font-bold text-[12px] mb-4 text-gray-900 underline">Puestos</h3>
                            <div className="flex flex-col gap-5 mb-8">
                                {formData.puestos_asignados.map((asignacion, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="w-40 flex items-center gap-1 shrink-0 pt-1">
                                            <User className="w-4 h-4 fill-blue-800 text-blue-800" />
                                            <span>Puesto {index + 1}:</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <select value={asignacion.departamento_id} onChange={(e) => handlePuestoChange(index, 'departamento_id', e.target.value)} className="border border-gray-300 px-1.5 py-0.5 w-64 bg-white outline-none focus:border-blue-500">
                                                <option value="">Seleccione un departamento</option>
                                                {departamentos.map(dep => (<option key={dep.id} value={dep.id}>{dep.nombre}</option>))}
                                            </select>
                                            <select value={asignacion.puesto_id} onChange={(e) => handlePuestoChange(index, 'puesto_id', e.target.value)} className="border border-gray-300 px-1.5 py-0.5 w-64 bg-white outline-none focus:border-blue-500">
                                                <option value="">Seleccione cargo</option>
                                                {puestosLista.map(puesto => (<option key={puesto.id} value={puesto.id}>{puesto.nombre}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- ROLES --- */}
                            <div className="border-t border-gray-300 pt-4 mb-8">
                                <h3 className="font-bold text-[12px] mb-4 underline">Roles</h3>
                                <div className="flex flex-col gap-3">
                                    {rolesLista.map((rol) => (
                                        <label key={rol.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 w-max rounded">
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(rol.id)}
                                                onChange={() => handleRoleToggle(rol.id)}
                                                className="w-3 h-3"
                                            />
                                            <User className="w-4 h-4 fill-blue-800 text-blue-800" />
                                            <span>{rol.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="bg-white border-t border-gray-300 p-4 flex gap-2">
                            <Button variant="submit">Guardar Cambios</Button>
                            <Button variant="cancelar" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};