import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormRol from '../../components/FormRol';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const EditarRolPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '', nombre: '', funciones: '',
        educacion_indispensable: '', educacion_deseable: '',
        formacion_indispensable: '', formacion_deseable: '',
        capacidades_indispensable: '', capacidades_deseable: '',
        experiencia_indispensable: '', experiencia_deseable: '',
        orden: 0, activo: true
    });

    useEffect(() => {
        const fetchRol = async () => {
            try {
                const response = await api.get(`/roles/${id}`);
                const data = response.data;
                Object.keys(data).forEach(key => { if (data[key] === null) data[key] = ''; });
                setFormData(data);
            } catch (error) {
                console.error('Error al cargar', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRol();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await confirm({ title: 'Actualizar rol', message: '¿Está seguro de guardar los cambios en este rol?' });
        if (!ok) return;
        try {
            const payload = {
                codigo: formData.codigo, nombre: formData.nombre, funciones: formData.funciones,
                educacion_indispensable: formData.educacion_indispensable, educacion_deseable: formData.educacion_deseable,
                formacion_indispensable: formData.formacion_indispensable, formacion_deseable: formData.formacion_deseable,
                capacidades_indispensable: formData.capacidades_indispensable, capacidades_deseable: formData.capacidades_deseable,
                experiencia_indispensable: formData.experiencia_indispensable, experiencia_deseable: formData.experiencia_deseable,
                orden: Number(formData.orden), activo: Boolean(formData.activo)
            };
            await api.patch(`/roles/${id}`, payload);
            toast({ message: 'Rol actualizado correctamente.' });
            navigate(`/rrhh/roles/${id}`);
        } catch (error: any) {
            console.error('Detalle del error del backend:', error.response?.data || error);
            const mensajeBackend = error.response?.data?.message;
            const mensajeAlerta = Array.isArray(mensajeBackend) ? mensajeBackend.join('\n') : mensajeBackend || 'Error al actualizar el rol';
            await alert({ message: mensajeAlerta });
        }
    };

    if (loading) return <div className="p-4 text-sm">Cargando formulario...</div>;

    return (
        <div className="max-w-5xl border border-gray-300 rounded shadow-sm bg-gray-50">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Editar rol: {formData.nombre}</h2>
            </div>
            <FormRol formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEdit={true} />
        </div>
    );
};