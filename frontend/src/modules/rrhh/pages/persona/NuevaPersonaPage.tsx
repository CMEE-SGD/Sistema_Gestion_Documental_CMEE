import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../../../../core/api/axios';
import FormPersona from '../../components/FormPersona';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { validarCedula } from '../../../../shared/utils/utils';

export const NuevaPersonaPage = () => {
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();

    const [rolesLista, setRolesLista] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [puestosLista, setPuestosLista] = useState([]);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [documentosFiles, setDocumentosFiles] = useState<File[]>([]);

    // 👇 Estado inicial actualizado
    const [formData, setFormData] = useState({
        grado: '', nombre: '', apellidos: '', cedula_identidad: '',
        fecha_nacimiento: '', sexo: '', domicilio: '', ciudad: '', provincia: '',
        celular_1: '', celular_2: '', email_1: '', email_2: '',
        tipo_recurso: 'Usuario externo', orden: 0, 
        estado: 'ACTIVO', // Enum de Prisma
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const ci = formData.cedula_identidad;
        if (ci && /^\d{10}$/.test(ci) && !validarCedula(ci)) {
            await alert({ message: 'La cédula ingresada no es válida.' });
            return;
        }

        try {
            const payload = new FormData();

            // 👇 Campos actualizados
            const camposValidos = [
                'grado', 'nombre', 'apellidos', 'cedula_identidad',
                'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia',
                'celular_1', 'celular_2', 'email_1', 'email_2',
                'estado', 'tipo_recurso', 'idioma', 'roles', 'puestos_asignados'
            ];

            Object.entries(formData).forEach(([key, value]) => {
                if (!camposValidos.includes(key)) return; 
                if (key === 'roles' || key === 'puestos_asignados') {
                    payload.append(key, JSON.stringify(value));
                } else {
                    payload.append(key, String(value));
                }
            });

            if (fotoFile) payload.append('foto', fotoFile);
            documentosFiles.forEach(file => payload.append('documentos', file));

            await api.post('/personas', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast({ message: 'Recurso creado exitosamente.' });
            navigate('/rrhh/personas');
        } catch (error) {
            console.error('Error al guardar', error);
            await alert({ message: 'Error al crear el recurso.' });
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