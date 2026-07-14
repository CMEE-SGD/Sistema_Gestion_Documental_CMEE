import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormPuesto from '../../components/FormPuesto';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const NuevoPuestoPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        codigo: '', nombre: '', educacion: '', formacion: '', habilidad: '', experiencia: '',
        conocimiento_tecnico: '', calificacion: '', autoridad: '', responsabilidades: '',
        funcion_principal: '', funciones_alternas: '', funciones: '',
        perfil_educacion_indispensable: '', perfil_formacion_deseable: '',
        perfil_capacidades_deseable: '', perfil_experiencia_deseable: '',
        orden: 0, activo: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/puestos', formData);
            toast({ message: 'Puesto creado correctamente.' });
            navigate('/rrhh/puestos');
        } catch (error) {
            console.error('Error guardando', error);
        }
    };

    return (
        <div className="max-w-6xl border border-gray-300 rounded shadow-sm bg-white">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Nuevo puesto</h2>
            </div>

            <FormPuesto 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit} 
                isEdit={false} 
            />
        </div>
    );
};