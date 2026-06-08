import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';

export const NuevoGrupoPage = () => {
    const navigate = useNavigate();

    // Estado para los selects
    const [grupos, setGrupos] = useState<any[]>([]);
    const [personas, setPersonas] = useState<any[]>([]);

    // Estado del formulario mapeado al backend
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        orden: 0,
        tipo: 'Departamento',
        dependencia_id: '',
        responsable_id: '',
        activo: true
    });

    useEffect(() => {
        // Cargar datos para los selects al montar el componente
        const fetchData = async () => {
            try {
                const [resGrupos, resPersonas] = await Promise.all([
                    api.get('/departamentos'),
                    api.get('/personas')
                ]);
                setGrupos(resGrupos.data);
                setPersonas(resPersonas.data);
            } catch (error) {
                console.error('Error cargando dependencias', error);
            }
        };
        fetchData();
    }, []);

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
            // Formatear IDs a null si están vacíos para evitar errores de Prisma
            const payload = {
                ...formData,
                dependencia_id: formData.dependencia_id ? Number(formData.dependencia_id) : undefined,
                responsable_id: formData.responsable_id ? Number(formData.responsable_id) : undefined,
            };

            await api.post('/departamentos', payload);
            navigate('/rrhh/grupos'); // Volver a la tabla al tener éxito
        } catch (error) {
            console.error('Error guardando', error);
            alert('Hubo un error al guardar');
        }
    };

    return (
        <div className="max-w-4xl border border-gray-300 rounded shadow-sm bg-gray-50">
            {/* Cabecera estilo UI antigua */}
            <div className="bg-[#8eb8d5] px-4 py-2 border-b border-gray-300">
                <h2 className="text-white font-bold">Nuevo grupo de organización</h2>
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
                    <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required className="border p-1 w-64" />
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

                {/* Botones */}
                <div className="pt-4 flex gap-2">
                    <Button variant="submit">Aceptar</Button>
                    <Button variant="cancelar" />
                </div>
            </form>
        </div>
    );
};