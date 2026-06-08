import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import api from '../../../../core/api/axios';
import FormPersona from '../../components/FormPersona';

export const EditarPersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [rolesLista, setRolesLista] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [puestosLista, setPuestosLista] = useState([]);

    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [documentosFiles, setDocumentosFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        codigo: '', saludo: '', nombre: '', apellidos: '', cedula_identidad: '',
        fecha_nacimiento: '', sexo: '', domicilio: '', ciudad: '', provincia: '',
        codigo_postal: '', telefono: '', fax: '', celular: '', email_1: '', email_2: '',
        tipo_recurso: 'Usuario externo', orden: 0, activo: true,
        roles: [] as number[],
        mostrar_ampliacion: false,
        puestos_asignados: [{ departamento_id: '', puesto_id: '' }]
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [rolesRes, deptRes, puestosRes, personaRes] = await Promise.all([
                    api.get('/roles'), api.get('/departamentos'), api.get('/puestos'), api.get(`/personas/${id}`)
                ]);

                setRolesLista(rolesRes.data);
                setDepartamentos(deptRes.data);
                setPuestosLista(puestosRes.data);

                const persona = personaRes.data;

                const rolesIds = persona.roles ? persona.roles.map((r: any) => r.id) : [];

                let puestosMapeados = [{ departamento_id: '', puesto_id: '' }];
                if (persona.puestos && persona.puestos.length > 0) {
                    puestosMapeados = persona.puestos.map((p: any) => ({
                        departamento_id: p.departamento?.id || '',
                        puesto_id: p.puesto?.id || ''
                    }));
                    if (puestosMapeados.length < 3) {
                        puestosMapeados.push({ departamento_id: '', puesto_id: '' });
                    }
                }

                const dataLimpia = { ...persona };
                Object.keys(dataLimpia).forEach(key => {
                    if (dataLimpia[key] === null) dataLimpia[key] = '';
                });

                setFormData(prev => ({
                    ...prev,
                    ...dataLimpia,
                    roles: rolesIds,
                    puestos_asignados: puestosMapeados,
                    mostrar_ampliacion: !!persona.mostrar_ampliacion
                }));

            } catch (error) {
                console.error('Error cargando datos para edición', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) cargarDatos();
    }, [id]);

    // Función requerida por FormPersona
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        if (name === 'tipo_recurso') return;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload = new FormData();
        
        // ✅ CAMPOS VÁLIDOS SEGÚN TU SCHEMA DE PRISMA
        const camposValidos = [
            'codigo', 'saludo', 'nombre', 'apellidos', 'cedula_identidad',
            'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia',
            'codigo_postal', 'telefono', 'fax', 'celular', 'email_1', 'email_2',
            'activo', 'tipo_recurso', 'idioma', 'roles', 'puestos_asignados'
        ];

        Object.entries(formData).forEach(([key, value]) => {
            if (!camposValidos.includes(key)) return; // ️ Ignora campos inválidos
            
            if (key === 'roles' || key === 'puestos_asignados') {
                payload.append(key, JSON.stringify(value));
            } else if (key === 'activo') {
                payload.append(key, String(value));
            } else {
                payload.append(key, String(value));
            }
        });

        if (fotoFile) payload.append('foto', fotoFile);
        documentosFiles.forEach(file => payload.append('documentos', file));

        await api.patch(`/personas/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Recurso actualizado exitosamente.');
        navigate(`/rrhh/personas/${id}`);
    } catch (error) {
        console.error('Error al actualizar', error);
        alert('Error al actualizar el recurso.');
    }
};

    if (loading) return <div className="p-8 text-center text-[11px] text-gray-500 font-sans">Cargando formulario y datos del recurso...</div>;

    return (
        <div className="max-w-5xl border border-gray-300 rounded shadow-sm bg-white font-sans">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-300 bg-gray-50">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-gray-800 font-bold text-xs uppercase tracking-wider">Editar Recurso Humano</h2>
            </div>

            <FormPersona
                formData={formData}
                onChange={handleChange}
                setFormData={setFormData}
                setFotoFile={setFotoFile}
                documentosFiles={documentosFiles}
                setDocumentosFiles={setDocumentosFiles}
                rolesLista={rolesLista}
                departamentos={departamentos}
                puestosLista={puestosLista}
                onSubmit={handleSubmit}
                isEdit={true}
            />
        </div>
    );
};