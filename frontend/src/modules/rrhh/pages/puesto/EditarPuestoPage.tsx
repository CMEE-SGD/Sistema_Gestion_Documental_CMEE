import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormPuesto from '../../components/FormPuesto';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';

export const EditarPuestoPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '', nombre: '', educacion: '', formacion: '', habilidad: '', experiencia: '',
        conocimiento_tecnico: '', calificacion: '', autoridad: '', responsabilidades: '',
        funcion_principal: '', funciones_alternas: '', funciones: '',
        perfil_educacion_indispensable: '', perfil_formacion_deseable: '',
        perfil_capacidades_deseable: '', perfil_experiencia_deseable: '',
        orden: 0, activo: true
    });

    useEffect(() => {
        const fetchPuesto = async () => {
            try {
                const response = await api.get(`/puestos/${id}`);
                const data = response.data;
                Object.keys(data).forEach(key => { if (data[key] === null) data[key] = ''; });
                setFormData(data);
            } catch (error) {
                console.error('Error cargando puesto', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPuesto();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await confirm({ title: 'Actualizar puesto', message: '¿Está seguro de guardar los cambios en este puesto?' });
        if (!ok) return;
        try {
            // Extraemos SOLO los campos permitidos por el DTO de NestJS para evitar el Error 400
            const payload = {
                codigo: formData.codigo, 
                nombre: formData.nombre, 
                educacion: formData.educacion, 
                formacion: formData.formacion, 
                habilidad: formData.habilidad, 
                experiencia: formData.experiencia,
                conocimiento_tecnico: formData.conocimiento_tecnico, 
                calificacion: formData.calificacion, 
                autoridad: formData.autoridad, 
                responsabilidades: formData.responsabilidades,
                funcion_principal: formData.funcion_principal, 
                funciones_alternas: formData.funciones_alternas, 
                funciones: formData.funciones,
                perfil_educacion_indispensable: formData.perfil_educacion_indispensable, 
                perfil_formacion_deseable: formData.perfil_formacion_deseable,
                perfil_capacidades_deseable: formData.perfil_capacidades_deseable, 
                perfil_experiencia_deseable: formData.perfil_experiencia_deseable,
                orden: Number(formData.orden) || 0, 
                activo: formData.activo
            };

            await api.patch(`/puestos/${id}`, payload);
            toast({ message: 'Puesto actualizado correctamente.' });
            navigate(`/rrhh/puestos/${encodeId(id)}`);
        } catch (error: any) {
            const mensajeBackend = error.response?.data?.message || error.message;
            console.error('Error detallado del backend:', error.response?.data);
            await alert({ message: `Error al actualizar: ${JSON.stringify(mensajeBackend)}` });
        }
    };

    if (loading) return <div className="p-4">Cargando formulario...</div>;

    return (
        <div className="max-w-6xl border border-gray-300 rounded shadow-sm bg-white">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Editar puesto: {formData.nombre}</h2>
            </div>

            <FormPuesto 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit} 
                isEdit={true} 
            />
        </div>
    );
};