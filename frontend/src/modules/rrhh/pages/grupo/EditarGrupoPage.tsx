import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormGrupo from '../../components/FormGrupo';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';

export const EditarGrupoPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { confirm } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    // PATCH: Nuevo estado para laboratorios
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', codigo: '', orden: 0,
        tipo: 'Departamento', dependencia_id: '', responsable_id: '', activo: true,
        // PATCH: Inicializar laboratorio_id
        laboratorio_id: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            // PATCH: Agregar GET /laboratorios al fetch paralelo
            const [resDept, resGrupos, resPersonas, resLaboratorios] = await Promise.all([
                api.get(`/departamentos/${id}`), api.get('/departamentos'), api.get('/personas'), api.get('/laboratorios')
            ]);
            setFormData(resDept.data);
            setGrupos(resGrupos.data.filter((g: any) => g.id !== Number(id)));
            setPersonas(resPersonas.data);
            setLaboratorios(resLaboratorios.data);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await confirm({ title: 'Actualizar grupo', message: '¿Está seguro de guardar los cambios en este grupo?' });
        if (!ok) return;
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            codigo: formData.codigo,
            orden: Number(formData.orden),
            tipo: formData.tipo,
            activo: formData.activo,
            dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : null,
            responsable_id: formData.responsable_id ? Number(formData.responsable_id) : null,
            // PATCH: Incluir laboratorio_id en el payload
            laboratorio_id: formData.laboratorio_id ? Number(formData.laboratorio_id) : null,
        };
        await api.patch(`/departamentos/${id}`, payload);
        toast({ message: 'Grupo actualizado correctamente.' });
        navigate(`/rrhh/grupos/${encodeId(id)}`);
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="max-w-4xl border border-gray-300 rounded shadow-sm bg-gray-50">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Editar grupo: {formData.nombre}</h2>
            </div>
            {/* PATCH: Pasar laboratorios al formulario */}
            <FormGrupo formData={formData} setFormData={setFormData} grupos={grupos} personas={personas} laboratorios={laboratorios} onSubmit={handleSubmit} isEdit={true} />
        </div>
    );
};