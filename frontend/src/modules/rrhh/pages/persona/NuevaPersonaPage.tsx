import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../../../../core/api/axios';
import FormPersona from '../../components/FormPersona';

export const NuevaPersonaPage = () => {
    const navigate = useNavigate();

    // Listas para los selects
    const [rolesLista, setRolesLista] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [puestosLista, setPuestosLista] = useState([]);

    // Archivos
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [documentosFiles, setDocumentosFiles] = useState<File[]>([]);

    // Estado principal
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
        const cargarListas = async () => {
            try {
                const [rolesRes, deptRes, puestosRes] = await Promise.all([
                    api.get('/roles'), api.get('/departamentos'), api.get('/puestos')
                ]);
                setRolesLista(rolesRes.data);
                setDepartamentos(deptRes.data);
                setPuestosLista(puestosRes.data);
            } catch (error) {
                console.error('Error cargando catálogos', error);
            }
        };
        cargarListas();
    }, []);

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

            // ✅ CAMPOS VÁLIDOS SEGÚN PRISMA
            const camposValidos = [
                'codigo', 'saludo', 'nombre', 'apellidos', 'cedula_identidad',
                'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia',
                'codigo_postal', 'telefono', 'fax', 'celular', 'email_1', 'email_2',
                'activo', 'tipo_recurso', 'idioma', 'roles', 'puestos_asignados'
            ];

            Object.entries(formData).forEach(([key, value]) => {
                if (!camposValidos.includes(key)) return; // Ignora campos inválidos

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

            await api.post('/personas', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Recurso creado exitosamente.');
            navigate('/rrhh/personas');
        } catch (error) {
            console.error('Error al guardar', error);
            alert('Error al crear el recurso.');
        }
    };

    return (
        <div className="max-w-5xl border border-gray-300 rounded shadow-sm bg-white font-sans">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-300 bg-gray-50">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <h2 className="text-gray-800 font-bold text-xs uppercase tracking-wider">Nuevo Recurso Humano</h2>
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
                isEdit={false}
            />
        </div>
    );
};