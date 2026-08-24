import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormGrupo from '../../components/FormGrupo';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const NuevoGrupoPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    // PATCH: Nuevo estado para laboratorios
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', codigo: '', orden: 0,
        tipo: 'Departamento', dependencia_id: '', responsable_id: '', activo: true,
        // PATCH: Inicializar laboratorio_id como string vacío
        laboratorio_id: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            // PATCH: Agregar GET /laboratorios al fetch paralelo
            const [resGrupos, resPersonas, resLaboratorios] = await Promise.all([
                api.get('/departamentos'), api.get('/personas'), api.get('/laboratorios')
            ]);
            setGrupos(resGrupos.data);
            setPersonas(resPersonas.data);
            setLaboratorios(resLaboratorios.data);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // PATCH: Incluir laboratorio_id en el payload
            await api.post('/departamentos', {
                ...formData,
                dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : undefined,
                responsable_id: formData.responsable_id ? Number(formData.responsable_id) : undefined,
                laboratorio_id: formData.laboratorio_id ? Number(formData.laboratorio_id) : undefined,
            });
            toast({ message: 'Grupo creado correctamente.' });
            navigate('/rrhh/grupos');
        } catch (error) {
            console.error('Error guardando', error);
        }
    };

    return (
        <div className="max-w-4xl border border-gray-300 rounded shadow-sm bg-gray-50">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Nuevo grupo de organización</h2>
            </div>
            {/* PATCH: Pasar laboratorios al formulario */}
            <FormGrupo formData={formData} setFormData={setFormData} grupos={grupos} personas={personas} laboratorios={laboratorios} onSubmit={handleSubmit} />
        </div>
    );
};