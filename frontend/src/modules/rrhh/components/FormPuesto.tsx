import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../../../shared/components/atoms/button';

// --- Molécula Interna ---
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

// --- Organismo Principal ---
interface FormPuestoProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
}

const FormPuesto = ({ formData, setFormData, onSubmit, isEdit = false }: FormPuestoProps) => {

    // Manejadores encapsulados
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleRichTextChange = (content: string, name: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: content }));
    };

    return (
        <form onSubmit={onSubmit} className="p-4 text-sm">
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
                <Button variant="submit">{isEdit ? 'Guardar Cambios' : 'Aceptar'}</Button>
                <Button variant="cancelar" />
            </div>
        </form>
    );
};

export default FormPuesto;