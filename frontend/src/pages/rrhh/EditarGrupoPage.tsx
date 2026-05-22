import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';

export const EditarGrupoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        orden: 0,
        tipo: 'Departamento',
        dependencia_id: '' as string | number,
        responsable_id: '' as string | number,
        activo: true
    });

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [resDept, resGrupos, resPersonas] = await Promise.all([
            api.get(`/departamentos/${id}`),
            api.get('/departamentos'),
            api.get('/personas')
            ]);
            
            const depto = resDept.data;
            // Llenar el formulario con los datos actuales
            setFormData({
            nombre: depto.nombre,
            descripcion: depto.descripcion || '',
            codigo: depto.codigo,
            orden: depto.orden || 0,
            tipo: depto.tipo || 'Departamento',
            dependencia_id: depto.dependencia_id || '',
            responsable_id: depto.responsable_id || '',
            activo: depto.activo
            });

            // Filtrar el grupo actual para que no pueda ser su propio padre
            setGrupos(resGrupos.data.filter((g: any) => g.id !== Number(id)));
            setPersonas(resPersonas.data);
        } catch (error) {
            console.error('Error cargando datos de edición', error);
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        const payload = {
            ...formData,
            dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : null,
            responsable_id: formData.responsable_id ? Number(formData.responsable_id) : null,
        };
        
        // Enviar actualización
        await api.patch(`/departamentos/${id}`, payload);
        // Retornar al detalle del grupo editado
        navigate(`/rrhh/grupos/${id}`); 
        } catch (error) {
        console.error('Error actualizando', error);
        alert('Hubo un error al actualizar el grupo');
        }
    };

    if (loading) return <div className="p-4 text-sm">Cargando formulario...</div>;

    return (
        <div className="max-w-4xl border border-gray-300 rounded shadow-sm bg-gray-50">
        <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
            <h2 className="text-white font-bold">Editar grupo de organización: {formData.nombre}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Nombre:</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="border p-1 w-full max-w-lg" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Descripción:</label>
            <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="border p-1 w-full max-w-lg" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Código:</label>
            <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required className="border p-1 w-64 bg-gray-100" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Orden:</label>
            <input type="number" name="orden" value={formData.orden} onChange={handleChange} className="border p-1 w-20" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Tipo:</label>
            <div className="flex gap-4">
                <label className="flex items-center gap-1">
                <input type="radio" name="tipo" value="Departamento" checked={formData.tipo === 'Departamento'} onChange={handleChange} /> Departamento
                </label>
                <label className="flex items-center gap-1">
                <input type="radio" name="tipo" value="Grupo de trabajo" checked={formData.tipo === 'Grupo de trabajo'} onChange={handleChange} /> Grupo de trabajo
                </label>
            </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Grupo enlazado:</label>
            <select name="dependencia_id" value={formData.dependencia_id} onChange={handleChange} className="border p-1 w-64">
                <option value="">Grupo no enlazado</option>
                {grupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
            </select>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-b border-gray-200 pb-2">
            <label>Responsable:</label>
            <select name="responsable_id" value={formData.responsable_id} onChange={handleChange} className="border p-1 w-64">
                <option value="">Seleccione responsable</option>
                {personas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                ))}
            </select>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4 pb-2">
            <label>Estado:</label>
            <label className="flex items-center gap-1">
                <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} /> Activo
            </label>
            </div>

            <div className="pt-4 flex gap-2">
            <button type="submit" className="bg-[#006699] text-white px-4 py-1 rounded shadow-sm hover:bg-blue-800">Guardar Cambios</button>
            <button type="button" onClick={() => navigate(`/rrhh/grupos/${id}`)} className="bg-gray-100 border border-gray-300 px-4 py-1 rounded shadow-sm hover:bg-gray-200">Cancelar</button>
            </div>
        </form>
        </div>
    );
};