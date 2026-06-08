import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';

// 1. EL COMPONENTE AUXILIAR VA AFUERA
interface TextAreaFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaField = ({ label, name, value, onChange }: TextAreaFieldProps) => (
    <div className="grid grid-cols-[200px_1fr] items-start gap-4 pb-4">
        <label className="font-medium mt-2">{label}</label>
        <textarea 
            name={name} 
            value={value} 
            onChange={onChange} 
            rows={3} 
            className="border border-gray-300 p-2 w-full max-w-3xl rounded resize-y" 
        />
    </div>
);

// 2. COMPONENTE PRINCIPAL
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                    type === 'number' ? Number(value) : value
        }));
    };

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

            <form onSubmit={handleSubmit} className="p-4 text-sm">
                {/* Datos Básicos */}
                <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                    <label>Código:</label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border p-1 w-64" />
                </div>
                <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                    <label>Nombre:</label>
                    <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border p-1 w-full max-w-lg" />
                </div>
                
                {/* 3. AHORA PASAMOS value y onChange COMO PROPS */}
                <TextAreaField label="Funciones:" name="funciones" value={formData.funciones} onChange={handleChange} />

                {/* Separador */}
                <div className="text-center font-bold bg-gray-100 py-1 border-y border-gray-300 mb-4 tracking-widest">
                    PERFIL PROFESIONAL
                </div>

                <h3 className="font-bold mb-2">Educación</h3>
                <TextAreaField label="Indispensable:" name="educacion_indispensable" value={formData.educacion_indispensable} onChange={handleChange} />
                <TextAreaField label="Deseable:" name="educacion_deseable" value={formData.educacion_deseable} onChange={handleChange} />

                <h3 className="font-bold mb-2 border-t pt-4">Formación</h3>
                <TextAreaField label="Indispensable:" name="formacion_indispensable" value={formData.formacion_indispensable} onChange={handleChange} />
                <TextAreaField label="Deseable:" name="formacion_deseable" value={formData.formacion_deseable} onChange={handleChange} />

                <h3 className="font-bold mb-2 border-t pt-4">Capacidades y Competencias Personales</h3>
                <TextAreaField label="Indispensable:" name="capacidades_indispensable" value={formData.capacidades_indispensable} onChange={handleChange} />
                <TextAreaField label="Deseable:" name="capacidades_deseable" value={formData.capacidades_deseable} onChange={handleChange} />

                <h3 className="font-bold mb-2 border-t pt-4">Experiencia de Trabajo</h3>
                <TextAreaField label="Indispensable:" name="experiencia_indispensable" value={formData.experiencia_indispensable} onChange={handleChange} />
                <TextAreaField label="Deseable:" name="experiencia_deseable" value={formData.experiencia_deseable} onChange={handleChange} />

                {/* Configuración final */}
                <div className="border-t border-gray-300 pt-4 mt-2">
                    <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                        <label>Orden:</label>
                        <input type="number" name="orden" value={formData.orden} onChange={handleChange} className="border p-1 w-20" />
                    </div>
                    <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                        <label>Estado:</label>
                        <label className="flex items-center gap-1">
                            <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} /> Activo
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex gap-2">
                    <Button variant="submit">Aceptar</Button>
                    <Button variant="cancelar" />
                </div>
            </form>
        </div>
    );
};