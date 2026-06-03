import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import api from '../../lib/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Reutilizamos la misma interfaz y componente del editor
interface RichTextFieldProps {
    label: string; 
    name: string; 
    value: string;
    onChange: (content: string, name: string) => void;
}

const RichTextField = ({ label, name, value, onChange }: RichTextFieldProps) => (
    <div className="grid grid-cols-[200px_1fr] items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
        <label className="font-medium mt-2">{label}:</label>
        <div className="bg-white w-full max-w-4xl">
            <ReactQuill 
                theme="snow" 
                value={value || ''} 
                onChange={(content) => onChange(content, name)} 
                className="h-40 mb-12" 
            />
        </div>
    </div>
);

// AQUÍ ESTÁ LA CLAVE: El nombre correcto de la exportación
export const EditarPuestoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
                // Limpiamos los nulls para evitar warnings en los inputs
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleRichTextChange = (content: string, name: string) => {
        setFormData(prev => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Construimos el payload explícitamente solo con los datos editables
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
                orden: Number(formData.orden) || 0, // Aseguramos que sea número
                activo: formData.activo
            };

            await api.patch(`/puestos/${id}`, payload);
            navigate(`/rrhh/puestos/${id}`);
        } catch (error: any) {
            // Esto imprimirá exactamente de qué se queja el backend de NestJS
            const mensajeBackend = error.response?.data?.message || error.message;
            console.error('Error detallado del backend:', error.response?.data);
            alert(`Error al actualizar: ${JSON.stringify(mensajeBackend)}`);
        }
    };

    if (loading) return <div className="p-4">Cargando formulario...</div>;

    return (
        <div className="max-w-6xl border border-gray-300 rounded shadow-sm bg-white">
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Editar puesto: {formData.nombre}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 text-sm">
                <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4 border-b border-gray-100">
                    <label className="font-medium">Código:</label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border border-gray-300 p-1.5 w-64 rounded bg-white" />
                </div>
                <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4 border-b border-gray-100 mt-4">
                    <label className="font-medium">Nombre:</label>
                    <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border border-gray-300 p-1.5 w-full max-w-xl rounded bg-white" />
                </div>

                <div className="mt-4">
                    <RichTextField label="Educación" name="educacion" value={formData.educacion} onChange={handleRichTextChange} />
                    <RichTextField label="Formación" name="formacion" value={formData.formacion} onChange={handleRichTextChange} />
                    <RichTextField label="Habilidad" name="habilidad" value={formData.habilidad} onChange={handleRichTextChange} />
                    <RichTextField label="Experiencia" name="experiencia" value={formData.experiencia} onChange={handleRichTextChange} />
                    <RichTextField label="Conocimiento Técnico" name="conocimiento_tecnico" value={formData.conocimiento_tecnico} onChange={handleRichTextChange} />
                    <RichTextField label="Calificación" name="calificacion" value={formData.calificacion} onChange={handleRichTextChange} />
                    <RichTextField label="Autoridad" name="autoridad" value={formData.autoridad} onChange={handleRichTextChange} />
                    <RichTextField label="Responsabilidades" name="responsabilidades" value={formData.responsabilidades} onChange={handleRichTextChange} />
                    <RichTextField label="Función principal" name="funcion_principal" value={formData.funcion_principal} onChange={handleRichTextChange} />
                    <RichTextField label="Funciones alternas" name="funciones_alternas" value={formData.funciones_alternas} onChange={handleRichTextChange} />
                    <RichTextField label="Funciones" name="funciones" value={formData.funciones} onChange={handleRichTextChange} />
                </div>

                <div className="text-center font-bold bg-gray-100 py-2 border-y border-gray-300 my-6 tracking-widest">
                    PERFIL PROFESIONAL
                </div>

                <h3 className="font-bold mb-2 text-gray-700">Educación</h3>
                <RichTextField label="Indispensable" name="perfil_educacion_indispensable" value={formData.perfil_educacion_indispensable} onChange={handleRichTextChange} />

                <h3 className="font-bold mb-2 mt-4 text-gray-700">Formación</h3>
                <RichTextField label="Deseable" name="perfil_formacion_deseable" value={formData.perfil_formacion_deseable} onChange={handleRichTextChange} />

                <h3 className="font-bold mb-2 mt-4 text-gray-700">Capacidades y Competencias Personales</h3>
                <RichTextField label="Deseable" name="perfil_capacidades_deseable" value={formData.perfil_capacidades_deseable} onChange={handleRichTextChange} />

                <h3 className="font-bold mb-2 mt-4 text-gray-700">Experiencia de Trabajo</h3>
                <RichTextField label="Deseable" name="perfil_experiencia_deseable" value={formData.perfil_experiencia_deseable} onChange={handleRichTextChange} />

                <div className="border-t border-gray-300 pt-6 mt-4">
                    <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                        <label className="font-medium">Orden:</label>
                        <input type="number" name="orden" value={formData.orden} onChange={handleChange} className="border border-gray-300 p-1.5 w-24 rounded bg-white" />
                    </div>
                    <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
                        <label className="font-medium">Estado:</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="w-4 h-4 text-blue-600" /> Activo
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex gap-2 border-t border-gray-200 mt-4">
                    <Button variant="submit">Guardar Cambios</Button>
                    <Button variant="cancelar" />
                </div>
            </form>
        </div>
    );
};