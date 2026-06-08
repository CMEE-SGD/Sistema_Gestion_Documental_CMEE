import React from 'react';
import { Button } from '../../../shared/components/atoms/button';

interface FormGrupoProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    grupos: any[];
    personas: any[];
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
}

const FormGrupo = ({ formData, setFormData, grupos, personas, onSubmit, isEdit = false }: FormGrupoProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? Number(value) : value
        }));
    };

    return (
        <form onSubmit={onSubmit} className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Nombre:</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="border p-1 w-full max-w-lg bg-white" />
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Descripción:</label>
                <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="border p-1 w-full max-w-lg bg-white" />
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Código:</label>
                <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required className="border p-1 w-64 bg-white" />
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Orden:</label>
                <input type="number" name="orden" value={formData.orden} onChange={handleChange} className="border p-1 w-20 bg-white" />
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Tipo:</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="tipo" value="Departamento" checked={formData.tipo === 'Departamento'} onChange={handleChange} /> Departamento
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="tipo" value="Grupo de trabajo" checked={formData.tipo === 'Grupo de trabajo'} onChange={handleChange} /> Grupo de trabajo
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Grupo enlazado:</label>
                <select name="dependencia_id" value={formData.dependencia_id} onChange={handleChange} className="border p-1 w-64 bg-white">
                    <option value="">Grupo no enlazado</option>
                    {grupos.map(g => (<option key={g.id} value={g.id}>{g.nombre}</option>))}
                </select>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
                <label>Responsable:</label>
                <select name="responsable_id" value={formData.responsable_id} onChange={handleChange} className="border p-1 w-64 bg-white">
                    <option value="">Seleccione responsable</option>
                    {personas.map(p => (<option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>))}
                </select>
            </div>
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 pb-2">
                <label>Estado:</label>
                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} /> Activo
                </label>
            </div>
            <div className="pt-4 flex gap-2">
                <Button variant="submit">{isEdit ? 'Guardar Cambios' : 'Aceptar'}</Button>
                <Button variant="cancelar" />
            </div>
        </form>
    );
};

export default FormGrupo;