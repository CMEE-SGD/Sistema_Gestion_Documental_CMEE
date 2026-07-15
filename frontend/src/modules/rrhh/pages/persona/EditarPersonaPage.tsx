import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import api from '../../../../core/api/axios';
import FormPersona from '../../components/FormPersona';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { validarCedula } from '../../../../shared/utils/utils';

export const EditarPersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

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
        tipo_recurso: 'Usuario externo', orden: 0, estado: 'ACTIVO',
        roles: [] as number[],
        mostrar_ampliacion: false,
        puestos_asignados: [{ departamento_id: '', puesto_id: '' }],
        eliminar_foto: false 
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

                if (dataLimpia.fecha_nacimiento && dataLimpia.fecha_nacimiento.includes('T')) {
                    dataLimpia.fecha_nacimiento = dataLimpia.fecha_nacimiento.split('T')[0];
                }

                setFormData(prev => ({
                    ...prev,
                    ...dataLimpia,
                    roles: rolesIds,
                    puestos_asignados: puestosMapeados,
                    mostrar_ampliacion: !!persona.mostrar_ampliacion,
                    eliminar_foto: false
                }));

            } catch (error) {
                console.error('Error cargando datos para edición', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) cargarDatos();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const ci = formData.cedula_identidad;
        if (ci && /^\d{10}$/.test(ci) && !validarCedula(ci)) {
            await alert({ message: 'La cédula ingresada no es válida.' });
            return;
        }

        const ok = await confirm({ title: 'Actualizar recurso', message: '¿Está seguro de que desea guardar los cambios realizados en este recurso?' });
        if (!ok) return;

        try {
            const payload = new FormData();
            
            // 👇 Campos actualizados
            const camposValidos = [
                'grado', 'nombre', 'apellidos', 'cedula_identidad',
                'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia',
                'celular_1', 'celular_2', 'email_1', 'email_2',
                'estado', 'tipo_recurso', 'idioma', 'roles', 'puestos_asignados',
                'eliminar_foto' 
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

            await api.patch(`/personas/${id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast({ message: 'Recurso actualizado exitosamente.' });
            navigate(`/rrhh/personas/${id}`);
        } catch (error) {
            console.error('Error al actualizar', error);
            await alert({ message: 'Error al actualizar el recurso.' });
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