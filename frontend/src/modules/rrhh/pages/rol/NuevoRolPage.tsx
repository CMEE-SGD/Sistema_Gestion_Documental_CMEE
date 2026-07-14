import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormRol from '../../components/FormRol';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const NuevoRolPage = () => {
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        codigo: '', nombre: '', funciones: '',
        educacion_indispensable: '', educacion_deseable: '',
        formacion_indispensable: '', formacion_deseable: '',
        capacidades_indispensable: '', capacidades_deseable: '',
        experiencia_indispensable: '', experiencia_deseable: '',
        orden: 0, activo: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/roles', formData);
            toast({ message: 'Rol creado correctamente.' });
            navigate('/rrhh/roles');
        } catch (error) {
            console.error('Error al guardar', error);
            await alert({ message: 'Error guardando el rol' });
        }
    };

    return (
        <div className="max-w-5xl border border-gray-300 rounded shadow-sm bg-gray-50">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Nuevo rol</h2>
            </div>
            <FormRol formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEdit={false} />
        </div>
    );
};