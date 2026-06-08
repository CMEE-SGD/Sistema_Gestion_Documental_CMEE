import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button'; 
import { Briefcase, Users } from 'lucide-react';
import api from '../../../../core/api/axios';

// Importamos el nuevo componente reutilizable para la impresión
import PrintHeader  from '../../../../shared/components/organisms/PrintHeader';

export const PuestosPage = () => {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para los filtros
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    
    // Estado para alternar entre la tabla normal y el esquema
    const [vistaActual, setVistaActual] = useState<'tabla' | 'esquema'>('tabla');

    useEffect(() => {
        const fetchPuestos = async () => {
            try {
                const response = await api.get('/puestos');
                // Ordenamos por el campo orden que viene de la base de datos
                const ordenados = response.data.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
                setPuestos(ordenados);
            } catch (error) {
                console.error('Error cargando puestos', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPuestos();
    }, []);

    const formatearFecha = (cadena: string) => {
        if (!cadena) return '';
        return new Date(cadena).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Lógica de Filtrado
    const puestosFiltrados = puestos.filter(puesto => {
        if (filtroEstado === 'activo' && !puesto.activo) return false;
        if (filtroEstado === 'inactivo' && puesto.activo) return false;

        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoPuesto = `${puesto.nombre || ''} ${puesto.codigo || ''}`.toLowerCase();
            if (!textoPuesto.includes(busqueda)) {
                return false;
            }
        }
        return true; 
    });


    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">
            
            <PrintHeader 
                subtitulo={vistaActual === 'tabla' ? 'Listado General de Puestos' : 'Esquema de Puestos y Personal'}
                filtroAplicado={filtroEstado}
            />

            {vistaActual === 'tabla' ? (
                <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                    <Button onClick={() => navigate('/rrhh')} variant="clasico">Atrás</Button>
                    <Button onClick={() => navigate('/rrhh/puestos/nuevo')} variant="clasico">
                        Nuevo puesto
                    </Button>
                    <Button onClick={() => setVistaActual('esquema')} variant="clasico"> Ver esquema </Button>
                    <Button variant="imprimir">Imprimir</Button>
                    
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                            <select
                                id="filtroEstado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                                className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="activo">Sólo puestos activos</option>
                                <option value="inactivo">Sólo puestos inactivos</option>
                                <option value="todos">Todos</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="palabraClave" className="text-sm font-bold text-gray-700">Palabra clave:</label>
                            <input 
                                id="palabraClave"
                                type="text" 
                                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500"
                                value={palabraClave}
                                onChange={(e) => setPalabraClave(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                    <Button onClick={() => setVistaActual('tabla')} variant="clasico"> Atrás </Button>
                    <Button variant="imprimir"> Imprimir</Button>
                </div>
            )}

            {vistaActual === 'tabla' ? (
                /* VISTA: TABLA ORIGINAL */
                <div className="overflow-x-auto border border-gray-200 rounded shadow-sm print:shadow-none print:border-gray-400 print:w-full">
                    <table className="w-full text-sm text-left print:text-black">
                        <thead className="bg-[#8eb8d5] text-white font-bold print:bg-[#8eb8d5] print:text-black">
                            <tr>
                                <th className="px-4 py-2 border-b print:border-gray-400">Puesto</th>
                                <th className="px-4 py-2 border-b print:border-gray-400">Código</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Orden</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Fecha última mod.</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                            ) : puestosFiltrados.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron puestos.</td></tr>
                            ) : (
                                puestosFiltrados.map((puesto) => (
                                    <tr 
                                        key={puesto.id} 
                                        onClick={() => navigate(`/rrhh/puestos/${puesto.id}`)}
                                        className={`hover:bg-gray-100 cursor-pointer transition-colors print:break-inside-avoid ${!puesto.activo ? 'opacity-70 bg-gray-50 print:opacity-100' : ''}`}
                                    >
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-blue-800 print:text-black" />
                                            {puesto.nombre}
                                        </td>
                                        <td className="px-4 py-2">{puesto.codigo}</td>
                                        <td className="px-4 py-2 text-center">{puesto.orden}</td>
                                        <td className="px-4 py-2 text-center">{formatearFecha(puesto.fecha_ultima_mod || puesto.updatedAt)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs border ${puesto.activo ? 'bg-green-100 text-green-800 border-green-200 print:border-black print:bg-white print:text-black' : 'bg-red-100 text-red-800 border-red-200 print:border-black print:bg-white print:text-black'}`}>
                                                {puesto.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* VISTA: ESQUEMA JERÁRQUICO */
                <div className="border border-gray-300 print:border-gray-400 bg-white shadow-sm rounded-t overflow-hidden">
                    
                    {/* Cabecera Verde */}
                    <div className="grid grid-cols-12 bg-[#006600] print:bg-gray-200 text-white print:text-black text-sm font-bold border-b border-gray-300 print:border-gray-400">
                        <div className="col-span-4 px-4 py-2 border-r border-[#004d00] print:border-gray-400">
                            Puesto
                        </div>
                        <div className="col-span-8 px-4 py-2">
                            Personal
                        </div>
                    </div>

                    {/* Cuerpo del Esquema */}
                    <div className="flex flex-col">
                        {puestosFiltrados.map((puesto, index) => (
                            <div 
                                key={puesto.id} 
                                className={`grid grid-cols-12 text-[12px] border-b border-gray-200 print:border-gray-400 last:border-b-0 ${index % 2 === 0 ? 'bg-gray-100/60 print:bg-transparent' : 'bg-white print:bg-transparent'}`}
                            >
                                {/* Columna Izquierda: Puesto */}
                                <div className="col-span-4 px-4 py-3 flex items-start gap-2 border-r border-gray-200 print:border-gray-400">
                                    <Users className="w-4 h-4 text-blue-700 print:text-black shrink-0 mt-0.5" />
                                    <span className="text-gray-900 print:text-black font-medium">
                                        {puesto.nombre}
                                    </span>
                                </div>

                                {/* Columna Derecha: Personal */}
                                <div className="col-span-8 px-4 py-3 print:bg-transparent">
                                    {puesto.personas_asignadas && puesto.personas_asignadas.length > 0 ? (
                                        <ul className="flex flex-col gap-0.5">
                                            {puesto.personas_asignadas.map((asignacion: any, i: number) => (
                                                <li key={i} className="text-gray-800 print:text-black leading-tight">
                                                    {asignacion.persona?.apellidos}, {asignacion.persona?.nombre} 
                                                    {/* Mostrar código si existe */}
                                                    <span className="text-gray-600 print:text-gray-700 ml-1">
                                                        ({asignacion.persona?.codigo || ''})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-gray-400 print:text-gray-500 italic text-xs">Sin personal asignado</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};