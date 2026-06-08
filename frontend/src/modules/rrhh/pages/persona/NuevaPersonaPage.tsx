import { useEffect, useState } from 'react';
import { Button } from '../../../../shared/components/atoms/button';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { UserPlus, User } from 'lucide-react';

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

// COMPONENTE PRINCIPAL
export const NuevaPersonaPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [puestosLista, setPuestosLista] = useState<Puesto[]>([]);
    const [rolesLista, setRolesLista] = useState<Rol[]>([]);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [documentosFiles, setDocumentosFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        codigo: '', saludo: '', nombre: '', apellidos: '',
        cedula_identidad: '', fecha_nacimiento: '', sexo: 'M',
        domicilio: '', ciudad: '', codigo_postal: '', provincia: '',
        telefono: '', fax: '', celular: '', email_1: '', email_2: '',
        activo: true, tipo_recurso: 'Usuario del sistema',
        roles: [] as number[], // AHORA ES UN ARREGLO DE ROLES
        puestos_asignados: [
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' }
        ]
    });

    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [resDeptos, resPuestos, resRoles] = await Promise.all([
                    api.get('/departamentos'), api.get('/puestos'), api.get('/roles')
                ]);
                if (Array.isArray(resDeptos.data)) setDepartamentos(resDeptos.data);
                if (Array.isArray(resPuestos.data)) setPuestosLista(resPuestos.data);
                if (Array.isArray(resRoles.data)) setRolesLista(resRoles.data);
            } catch (error) {
                console.error('Error al cargar catálogos', error);
            }
        };
        fetchCatalogos();
    }, []);

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

    // Función específica para manejar los checkboxes de los roles
    const handleRoleToggle = (rolId: number) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(rolId)
                ? prev.roles.filter(id => id !== rolId) // Si ya estaba, lo quita
                : [...prev.roles, rolId] // Si no estaba, lo agrega
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit iniciado");
        setLoading(true);
        try {
            const formDataToSend = new FormData();

            // 1. Agregamos todos los campos de texto simples al FormData
            Object.keys(formData).forEach((key) => {
                if (key !== 'roles' && key !== 'puestos_asignados' && key !== 'fecha_nacimiento') {
                    formDataToSend.append(key, String(formData[key as keyof typeof formData]));
                }
            });

            // 2. Formateamos y agregamos la fecha
            if (formData.fecha_nacimiento) {
                formDataToSend.append('fecha_nacimiento', new Date(formData.fecha_nacimiento).toISOString());
            }
            // 4. Si el usuario seleccionó una foto, la adjuntamos
            if (fotoFile) {
                formDataToSend.append('foto', fotoFile);
            }

            // 3. Formateamos y agregamos los arreglos como JSON string
            formDataToSend.append('roles', JSON.stringify(formData.roles));

            const puestosValidos = formData.puestos_asignados
                .filter(p => p.departamento_id !== '' && p.puesto_id !== '')
                .map(p => ({
                    departamento_id: Number(p.departamento_id),
                    puesto_id: Number(p.puesto_id)
                }));
            formDataToSend.append('puestos_asignados', JSON.stringify(puestosValidos));



            documentosFiles.forEach(file => {
                formDataToSend.append('documentos', file);
            });
            // 5. Enviamos todo configurando el encabezado para multipart/form-data
            await api.post('/personas', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/rrhh/personas');
        } catch (error: any) {
            const msg = error.response?.data?.message;
            const detail = Array.isArray(msg) ? msg.join('\n') : (msg || 'Error desconocido del servidor');
            alert(`Error al crear persona:\n${detail}`);
            console.error('Error detallado:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 text-sm">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">Nuevo recurso</span>
            </div>

            <div className="p-4">
                <div className="border border-gray-300">
                    <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs">
                        Nuevo recurso
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
                                    {/* 👇 Modificamos el input para capturar la imagen */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                                        className="text-[10px]"
                                    />
                                    <div className="text-[9px] mt-1 text-black font-semibold">dimensiones Recomendadas 61px x 84px</div>
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-300 py-3 mb-6 flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                    <div className="w-40 font-bold pt-1">Documentos adjuntos <br /><span className="font-normal text-gray-500 text-[9px]">(CV, Certificados, etc)</span></div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            multiple // Permite elegir varios archivos a la vez
                                            accept=".pdf" // Restringe el selector solo a PDFs
                                            onChange={(e) => setDocumentosFiles(Array.from(e.target.files || []))}
                                            className="text-[11px] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:bg-gray-200 hover:file:bg-gray-300 cursor-pointer"
                                        />

                                        {/* Lista visual de los PDFs seleccionados */}
                                        {documentosFiles.length > 0 && (
                                            <ul className="mt-2 text-[10px] text-gray-700 list-disc pl-4 bg-gray-50 p-2 border border-gray-200 rounded w-max">
                                                {documentosFiles.map((file, idx) => (
                                                    <li key={idx} className="mb-0.5">
                                                        <span className="font-semibold text-blue-700">{file.name}</span>
                                                        <span className="text-gray-500 ml-1">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

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
                            <Button variant="submit">Aceptar</Button>
                            <Button variant="cancelar" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};