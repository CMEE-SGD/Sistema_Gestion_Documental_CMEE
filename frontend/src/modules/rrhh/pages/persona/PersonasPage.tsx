import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../../../core/api/axios';
import { Persona } from '../../interfaces/persona.interface';
import { Button } from '../../../../shared/components/atoms/button';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';

export const PersonasPage = () => {
    const navigate = useNavigate();

    // Estados principales
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para los filtros
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

    // LÓGICA DE FILTRADO
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
    // 1. Manejar un checkbox individual
    const handleCheckIndividual = (id: number) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id) // Si ya estaba, lo quita
                : [...prev, id]                    // Si no estaba, lo agrega
        );
    };

    // 2. Manejar el checkbox "Seleccionar Todos" de la cabecera
    const handleCheckTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Si marca "Todos", mete todos los IDs en el arreglo
            setSeleccionados(personas.map(p => p.id));
        } else {
            // Si desmarca, vacía el arreglo
            setSeleccionados([]);
        }
    };

    // 3. Función para el botón "Eliminar"
    const handleEliminarSeleccionados = async () => {
        if (seleccionados.length === 0) {
            alert("Por favor, seleccione al menos un recurso para eliminar.");
            return;
        }

        const confirmar = window.confirm(`¿Está seguro de que desea desactivar ${seleccionados.length} recurso(s)?`);
        if (!confirmar) return;

        try {
            // Enviamos la petición DELETE por cada ID seleccionado al mismo tiempo
            await Promise.all(seleccionados.map(id => api.delete(`/personas/${id}`)));

            alert('Recursos desactivados exitosamente.');
            setSeleccionados([]); // Limpiamos la selección

            // Llama aquí a la función que recarga tu tabla, por ejemplo:
            // fetchPersonas(); o recargar la página:
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

            {/* =========================================================
                BARRA DE HERRAMIENTAS Y ACCIONES (Oculta al imprimir)
            ========================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button variant="clasico" onClick={() => navigate('/rrhh')}>Atrás</Button>
                    <Button variant="clasico" onClick={() => navigate('/rrhh/personas/nuevo')}>Nuevo recurso</Button>
                    <Button variant="imprimir" />
                    <Button variant="clasico" onClick={handleEliminarSeleccionados} disabled={seleccionados.length === 0}>Eliminar</Button>
                    <Button variant="clasico" onClick={() => window.location.reload()}>Actualizar Listado</Button>
                </div>

                {/* FILTROS (Estado y Palabra Clave) */}
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

            {/* =========================================================
                TABLA DE PERSONAS
            ========================================================= */}
            <div className="px-4 print:px-0">
                <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white print:shadow-none print:border-gray-400 print:w-full">
                    <table className="w-full text-left whitespace-nowrap text-[11px] print:text-black print:text-[10px]">
                        <thead className="bg-[#006400] text-white font-bold print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                            <tr>
                                {/* Ocultamos la columna de checkboxes al imprimir porque en papel no sirven */}
                                <th className="px-4 py-2 w-10 text-center border-r border-[#004d00] print:hidden">
                                    <input type="checkbox" className="rounded" checked={seleccionados.length > 0 && seleccionados.length === personas.length} onChange={handleCheckTodos} />
                                </th>
                                <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400 cursor-pointer hover:bg-[#004d00] print:hover:bg-transparent">
                                    Apellidos
                                </th>
                                <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Nombre</th>
                                <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Puestos</th>
                                <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Usuario</th>
                                <th className="px-4 py-2 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Cargando datos...</td></tr>
                            ) : personasFiltradas.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay registros que coincidan con los filtros.</td></tr>
                            ) : (
                                personasFiltradas.map((persona) => (
                                    <tr
                                        key={persona.id}
                                        className={`hover:bg-gray-100 transition-colors print:break-inside-avoid ${!persona.activo ? 'opacity-60 bg-gray-50 print:opacity-100' : ''}`}
                                    >
                                        {/* Ocultamos el checkbox al imprimir */}
                                        <td className="px-4 py-2 text-center align-middle border-r border-gray-200 print:hidden">
                                            <input type="checkbox" className="rounded" checked={seleccionados.includes(persona.id)} onChange={() => handleCheckIndividual(persona.id)} />
                                        </td>

                                        <td className="px-4 py-2 border-r border-gray-200 print:border-gray-400 cursor-pointer" onClick={() => navigate(`/rrhh/personas/${persona.id}`)}>
                                            <div className="flex items-center gap-3">
                                                {/* En impresión, es mejor ocultar la foto para ahorrar tinta o evitar que se descuadre */}
                                                <div className="print:hidden">
                                                    {persona.foto_ruta ? (
                                                        <img
                                                            src={`${(import.meta as any).env.VITE_BACKEND_URL}${persona.foto_ruta}`} alt="Foto perfil"
                                                            className="w-full h-full object-cover"
                                                        />) : (
                                                        <div className="w-8 h-10 flex items-center justify-center bg-gray-200 border border-gray-300 text-gray-400">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-800 print:text-black">{persona.apellidos}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2 text-gray-700 print:text-black align-middle border-r border-gray-200 print:border-gray-400">
                                            {persona.nombre}
                                        </td>

                                        <td className="px-4 py-2 text-gray-700 print:text-black align-middle border-r border-gray-200 print:border-gray-400 whitespace-normal min-w-[200px]">
                                            {persona.puestos && persona.puestos.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {persona.puestos.map((p, i) => (
                                                        <span key={i}>• {p.puesto?.nombre} <span className="text-gray-500 print:text-gray-700">({p.departamento?.nombre})</span></span>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </td>

                                        <td className="px-4 py-2 align-middle border-r border-gray-200 print:border-gray-400">
                                            <span className={persona.usuario?.nombre_usuario === 'Usuario externo' ? "text-green-600 print:text-black" : "text-gray-800 print:text-black"}>
                                                {persona.usuario?.nombre_usuario || '-'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 align-middle text-center">
                                            <span className={`px-2 py-0.5 rounded font-bold border ${persona.activo ? 'text-[#006400] border-transparent print:border-black print:text-black' : 'text-red-600 border-transparent print:border-black print:text-black'}`}>
                                                {persona.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};