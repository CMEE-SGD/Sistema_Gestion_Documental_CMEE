import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormGrupo from '../../components/FormGrupo';

export const EditarGrupoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', codigo: '', orden: 0,
        tipo: 'Departamento', dependencia_id: '', responsable_id: '', activo: true
    });

    useEffect(() => {
        const fetchData = async () => {
            const [resDept, resGrupos, resPersonas] = await Promise.all([
                api.get(`/departamentos/${id}`), api.get('/departamentos'), api.get('/personas')
            ]);
            setFormData(resDept.data);
            setGrupos(resGrupos.data.filter((g: any) => g.id !== Number(id)));
            setPersonas(resPersonas.data);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            codigo: formData.codigo,
            orden: Number(formData.orden),
            tipo: formData.tipo,
            activo: formData.activo,
            dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : null,
            responsable_id: formData.responsable_id ? Number(formData.responsable_id) : null,
        };
        await api.patch(`/departamentos/${id}`, payload);
        navigate(`/rrhh/grupos/${id}`);
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="max-w-4xl border border-gray-300 rounded shadow-sm bg-gray-50">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Editar grupo: {formData.nombre}</h2>
            </div>
            <FormGrupo formData={formData} setFormData={setFormData} grupos={grupos} personas={personas} onSubmit={handleSubmit} isEdit={true} />
        </div>
    );
};