import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import FormRol from '../../components/FormRol';

export const NuevoRolPage = () => {
    const navigate = useNavigate();
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
            navigate('/rrhh/roles');
        } catch (error) {
            console.error('Error al guardar', error);
            alert('Error guardando el rol');
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