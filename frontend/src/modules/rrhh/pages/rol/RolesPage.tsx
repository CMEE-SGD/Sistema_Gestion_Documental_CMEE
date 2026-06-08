import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { Plus, UserCog} from 'lucide-react';
import api from '../../../../core/api/axios';
import PrintHeader  from '../../../../shared/components/organisms/PrintHeader';

export const RolesPage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para los filtros
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    // Estado para alternar entre la tabla normal y el esquema
    const [vistaActual, setVistaActual] = useState<'tabla' | 'esquema'>('tabla');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles');
                // Ordenar por el campo 'orden'
                const ordenados = response.data.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
                setRoles(ordenados);
            } catch (error) {
                console.error('Error cargando roles', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const formatearFecha = (cadena: string) => {
        if (!cadena) return '';
        const fecha = new Date(cadena);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const rolesFiltrados = roles.filter(rol => {
        // Filtro por Estado
        if (filtroEstado === 'activo' && !rol.activo) return false;
        if (filtroEstado === 'inactivo' && rol.activo) return false;

        // Filtro por Palabra Clave
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoRol = `${rol.nombre || ''} ${rol.codigo || ''}`.toLowerCase();
            if (!textoRol.includes(busqueda)) {
                return false;
            }
        }

        return true; 
    });
    
    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">

            <PrintHeader 
                subtitulo={vistaActual === 'tabla' ? 'Listado General de Roles' : 'Esquema de Roles y Personal'}
                filtroAplicado={filtroEstado}
            />

            {/* =========================================================
                BARRA DE HERRAMIENTAS (Se oculta al imprimir)
            ========================================================= */}
            {vistaActual === 'tabla' ? (
                <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                    <Button onClick={() => navigate('/rrhh')} variant="clasico"> Atrás</Button>
                    <Button onClick={() => navigate('/rrhh/roles/nuevo')} variant="clasico">
                        <Plus className="w-4 h-4" /> Nuevo rol
                    </Button>
                    <Button onClick={() => setVistaActual('esquema')} variant="clasico"> Ver esquema </Button>
                    <Button variant="imprimir"></Button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                            <select
                                id="filtroEstado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                                className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="activo">Sólo roles activos</option>
                                <option value="inactivo">Sólo roles inactivos</option>
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
                    <Button onClick={() => setVistaActual('tabla')} variant="clasico"> Atrás</Button>
                    <Button variant="imprimir"></Button>
                </div>
            )}

            {/* =========================================================
                ÁREA DE CONTENIDO
            ========================================================= */}
            {vistaActual === 'tabla' ? (
                /* VISTA: TABLA ORIGINAL */
                <div className="overflow-x-auto border border-gray-200 rounded shadow-sm print:shadow-none print:border-gray-400 print:w-full">
                    <table className="w-full text-sm text-left print:text-black">
                        <thead className="bg-[#8eb8d5] text-white font-bold print:bg-[#8eb8d5] print:text-black">
                            <tr>
                                <th className="px-4 py-2 border-b print:border-gray-400">Rol</th>
                                <th className="px-4 py-2 border-b print:border-gray-400">Código</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Orden</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Fecha última mod.</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                            ) : rolesFiltrados.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron roles con esos filtros.</td></tr>
                            ) : rolesFiltrados.map((rol) => (
                                <tr 
                                    key={rol.id} 
                                    onClick={() => navigate(`/rrhh/roles/${rol.id}`)}
                                    className={`hover:bg-gray-100 cursor-pointer transition-colors print:break-inside-avoid ${!rol.activo ? 'opacity-70 bg-gray-50 print:opacity-100' : ''}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <UserCog className="w-4 h-4 text-orange-500 print:text-black" />
                                        {rol.nombre}
                                    </td>
                                    <td className="px-4 py-2">{rol.codigo}</td>
                                    <td className="px-4 py-2 text-center">{rol.orden}</td>
                                    <td className="px-4 py-2 text-center">{formatearFecha(rol.updatedAt)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${rol.activo ? ' text-green-800 border-green-200 print:border-black print:bg-white print:text-black' : 'bg-red-100 text-red-800 border-red-200 print:border-black print:bg-white print:text-black'}`}>
                                            {rol.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* VISTA: ESQUEMA (Basada en la imagen de roles) */
                <div className="border border-gray-300 print:border-gray-400 bg-white shadow-sm rounded-t overflow-hidden">
                    
                    {/* Cabecera Verde */}
                    <div className="grid grid-cols-12 bg-[#006600] print:bg-gray-200 text-white print:text-black text-sm font-bold border-b border-gray-300 print:border-gray-400">
                        <div className="col-span-5 px-4 py-2 border-r border-[#004d00] print:border-gray-400">
                            Rol
                        </div>
                        <div className="col-span-7 px-4 py-2">
                            Personal
                        </div>
                    </div>

                    {/* Cuerpo del Esquema */}
                    <div className="flex flex-col">
                        {rolesFiltrados.map((rol, index) => (
                            <div 
                                key={rol.id} 
                                className={`grid grid-cols-12 text-[12px] border-b border-gray-200 print:border-gray-400 last:border-b-0 ${index % 2 === 0 ? 'bg-gray-100/60 print:bg-transparent' : 'bg-white print:bg-transparent'}`}
                            >
                                {/* Columna Izquierda: Rol */}
                                <div className="col-span-5 px-4 py-3 flex items-start gap-2 border-r border-gray-200 print:border-gray-400">
                                    <UserCog className="w-4 h-4 text-orange-500 print:text-black shrink-0 mt-0.5" />
                                    <span className="text-gray-900 print:text-black font-medium">
                                        {rol.nombre}
                                    </span>
                                </div>

                                {/* Columna Derecha: Personal */}
                                <div className="col-span-7 px-4 py-3 print:bg-transparent">
                                    {rol.personas && rol.personas.length > 0 ? (
                                        <ul className="flex flex-col gap-0.5">
                                            {rol.personas.map((persona: any, i: number) => (
                                                <li key={i} className="text-gray-800 print:text-black leading-tight">
                                                    {persona.apellidos}, {persona.nombre} 
                                                    {/* Mostrar código entre paréntesis como en la imagen () */}
                                                    <span className="text-gray-600 print:text-gray-700 ml-1">
                                                        ({persona.codigo || ''})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-gray-400 print:text-gray-500 italic text-[11px]">&nbsp;</span>
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