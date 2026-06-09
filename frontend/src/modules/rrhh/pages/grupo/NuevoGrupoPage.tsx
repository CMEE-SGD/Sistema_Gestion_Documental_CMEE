import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormGrupo from '../../components/FormGrupo';

export const NuevoGrupoPage = () => {
    const navigate = useNavigate();
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', codigo: '', orden: 0,
        tipo: 'Departamento', dependencia_id: '', responsable_id: '', activo: true
    });

    useEffect(() => {
        const fetchData = async () => {
            const [resGrupos, resPersonas] = await Promise.all([api.get('/departamentos'), api.get('/personas')]);
            setGrupos(resGrupos.data);
            setPersonas(resPersonas.data);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/departamentos', {
                ...formData,
                dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : undefined,
                responsable_id: formData.responsable_id ? Number(formData.responsable_id) : undefined,
            });
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
            <FormGrupo formData={formData} setFormData={setFormData} grupos={grupos} personas={personas} onSubmit={handleSubmit} />
        </div>
    );
};