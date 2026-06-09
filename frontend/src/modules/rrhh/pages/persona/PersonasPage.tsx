import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { Persona } from '../../interfaces/persona.interface';
import { Button } from '../../../../shared/components/atoms/button';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import TablaPersonas from '../../components/TablaPersonas';

export const PersonasPage = () => {
    const navigate = useNavigate();

    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);

    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                const response = await api.get('/personas');
                const ordenados = response.data.sort((a: Persona, b: Persona) =>
                    (a.apellidos || '').localeCompare(b.apellidos || '')
                );
                setPersonas(ordenados);
            } catch (error) {
                console.error('Error cargando personas', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonas();
    }, []);

    const personasFiltradas = personas.filter(persona => {
        if (filtroEstado === 'activo' && !persona.activo) return false;
        if (filtroEstado === 'inactivo' && persona.activo) return false;

        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const nombreCompleto = `${persona.nombre} ${persona.apellidos}`.toLowerCase();
            if (!nombreCompleto.includes(busqueda)) {
                return false;
            }
        }
        return true;
    });

    const handleCheckIndividual = (id: number) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleCheckTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSeleccionados(personas.map(p => p.id));
        } else {
            setSeleccionados([]);
        }
    };

    const handleEliminarSeleccionados = async () => {
        if (seleccionados.length === 0) {
            alert("Por favor, seleccione al menos un recurso para eliminar.");
            return;
        }

        const confirmar = window.confirm(`¿Está seguro de que desea desactivar ${seleccionados.length} recurso(s)?`);
        if (!confirmar) return;

        try {
            await Promise.all(seleccionados.map(id => api.delete(`/personas/${id}`)));
            alert('Recursos desactivados exitosamente.');
            setSeleccionados([]);
            window.location.reload();
        } catch (error) {
            console.error('Error al desactivar en masa', error);
            alert('Hubo un error al intentar desactivar algunos recursos.');
        }
    };

    return (
        <div className="flex flex-col gap-4 font-sans bg-white min-h-screen print:bg-white print:m-0">
            <PrintHeader
                subtitulo="Listado de Personal y Recursos Humanos"
                filtroAplicado={filtroEstado}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button variant="clasico" onClick={() => navigate('/rrhh')}>Atrás</Button>
                    <Button variant="clasico" onClick={() => navigate('/rrhh/personas/nuevo')}>Nuevo recurso</Button>
                    <Button variant="imprimir" />
                    <Button variant="clasico" onClick={handleEliminarSeleccionados} disabled={seleccionados.length === 0}>Eliminar</Button>
                    <Button variant="clasico" onClick={() => window.location.reload()}>Actualizar Listado</Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-[11px] font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="activo">Ver personal activo</option>
                            <option value="inactivo">Ver personal inactivo</option>
                            <option value="todos">Ver todo el personal</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="palabraClave" className="text-[11px] font-bold text-gray-700">Palabra clave:</label>
                        <input
                            id="palabraClave"
                            type="text"
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] w-48 focus:outline-none focus:border-blue-500"
                            value={palabraClave}
                            onChange={(e) => setPalabraClave(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <TablaPersonas 
                personas={personas}
                personasFiltradas={personasFiltradas}
                loading={loading}
                seleccionados={seleccionados}
                onCheckIndividual={handleCheckIndividual}
                onCheckTodos={handleCheckTodos}
            />
        </div>
    );
};