import { useEffect, useState } from 'react';
import { Plus, Users, FolderTree, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

// Importamos la interfaz y el componente reutilizable de cabecera
import { Departamento } from '../../../../shared/data/departamentos'; 
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';

export const GruposPage = () => {
    const navigate = useNavigate();
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados generales
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    const [vistaActual, setVistaActual] = useState<'tabla' | 'organigrama'>('tabla');
    
    // Estados específicos del organigrama
    const [verPersonal, setVerPersonal] = useState(true);
    const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | 'todos'>('todos');

    useEffect(() => {
        cargarDepartamentos();
    }, []);

    const cargarDepartamentos = async () => {
        try {
            const response = await api.get('/departamentos');
            const arbol = construirArbolJerarquico(response.data);
            setDepartamentos(arbol);
        } catch (error) {
            console.error('Error al cargar departamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const construirArbolJerarquico = (data: Departamento[], padreId: number | null = null, nivel: number = 0): Departamento[] => {
        let resultado: Departamento[] = [];
        const hijos = data
            .filter((d) => d.dependencia_id === padreId)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0)); 
        
        hijos.forEach((hijo) => {
            resultado.push({ ...hijo, nivel });
            resultado = resultado.concat(construirArbolJerarquico(data, hijo.id, nivel + 1));
        });
        
        return resultado;
    };

    // 1. FILTRO PARA LA TABLA GENERAL
    const gruposFiltrados = departamentos.filter(dep => {
        if (filtroEstado === 'activo' && !dep.activo) return false;
        if (filtroEstado === 'inactivo' && dep.activo) return false;
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoGrupo = `${dep.nombre || ''} ${dep.codigo || ''}`.toLowerCase();
            if (!textoGrupo.includes(busqueda)) {
                return false;
            }
        }
        return true; 
    });

    // 2. FILTRO JERÁRQUICO PARA EL ORGANIGRAMA
    let organigramaFiltrado = departamentos;
    if (grupoSeleccionadoId !== 'todos') {
        const startIndex = departamentos.findIndex(d => d.id === grupoSeleccionadoId);
        if (startIndex !== -1) {
            const nivelBase = departamentos[startIndex].nivel || 0;
            const result = [departamentos[startIndex]];
            for (let i = startIndex + 1; i < departamentos.length; i++) {
                const depActual = departamentos[i];
                if ((depActual.nivel || 0) > nivelBase) {
                    result.push(depActual);
                } else {
                    break;
                }
            }
            organigramaFiltrado = result;
        }
    }

    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">

            {/* CABECERA DE IMPRESIÓN (COMPONENTE REUTILIZABLE) */}
            <PrintHeader 
                subtitulo={vistaActual === 'tabla' ? 'Listado de Grupos de Organización' : 'Organigrama de Grupos de Organización'}
                filtroAplicado={vistaActual === 'tabla' ? filtroEstado : undefined}
            />

            {/* =========================================================
                BARRA DE HERRAMIENTAS (Se oculta al imprimir)
            ========================================================= */}
            {vistaActual === 'tabla' ? (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                    <div className="flex gap-2">
                        <Button onClick={() => navigate('/rrhh')} variant="clasico">Atrás</Button>
                        <Button onClick={() => navigate('/rrhh/grupos/nuevo')} variant="clasico">Nuevo grupo</Button>
                        <Button onClick={() => setVistaActual('organigrama')} variant="clasico">Organigrama</Button>
                        <Button variant="imprimir" />
                    </div>
                    
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                            <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                            <select
                                id="filtroEstado"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                                className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="activo">Sólo grupos activos</option>
                                <option value="inactivo">Sólo grupos inactivos</option>
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
                    <Button onClick={() => setVistaActual('tabla')} variant="clasico">Atrás</Button>
                    <Button variant = "imprimir"/>
                    
                    <div className="flex items-center gap-4 ml-4 border-l border-gray-300 pl-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" className="rounded" /> Ver grupos de trabajo
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={verPersonal}
                                onChange={(e) => setVerPersonal(e.target.checked)}
                                className="rounded" 
                            /> Ver personal
                        </label>
                        
                        {/* SELECT DINÁMICO PARA FILTRAR EL ORGANIGRAMA */}
                        <select 
                            className="p-1.5 text-sm border border-gray-300 rounded bg-white w-64 focus:outline-none focus:border-blue-500"
                            value={grupoSeleccionadoId}
                            onChange={(e) => setGrupoSeleccionadoId(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                        >
                            <option value="todos">Todos los grupos de organización</option>
                            {departamentos.map(dep => (
                                <option key={dep.id} value={dep.id}>
                                    {'-'.repeat(dep.nivel || 0)} {dep.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
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
                                <th className="px-4 py-2 border-b print:border-gray-400">Organigrama</th>
                                <th className="px-4 py-2 border-b print:border-gray-400">Tipo</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Estado</th>
                                <th className="px-4 py-2 text-center border-b print:border-gray-400">Nº usuarios</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                            {loading ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando estructura...</td></tr>
                            ) : gruposFiltrados.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron grupos.</td></tr>
                            ) : (
                                gruposFiltrados.map((dep) => (
                                    <tr 
                                        key={dep.id} 
                                        onClick={() => navigate(`/rrhh/grupos/${dep.id}`)}
                                        className={`hover:bg-gray-100 cursor-pointer transition-colors print:break-inside-avoid ${!dep.activo ? 'opacity-70 bg-gray-50 print:opacity-100' : ''}`}
                                    >
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            <span style={{ paddingLeft: `${(dep.nivel || 0) * 1.5}rem` }}></span>
                                            <Users className="w-4 h-4 text-blue-600 print:text-black" />
                                            <span className={dep.nivel === 0 ? 'font-bold' : ''}>{dep.nombre}</span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-600 print:text-black">{dep.tipo || 'Departamento'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs border ${dep.activo ? 'bg-green-100 text-green-800 border-green-200 print:border-black print:bg-white print:text-black' : 'bg-red-100 text-red-800 border-red-200 print:border-black print:bg-white print:text-black'}`}>
                                                {dep.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center print:text-black">{dep.puestos_asignados?.length || 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* VISTA: ORGANIGRAMA (Con bordes seguros para impresión) */
                <div className="border border-gray-300 print:border-gray-400 bg-white shadow-sm rounded-t overflow-hidden">
                    <div className="grid grid-cols-12 bg-[#006600] print:bg-gray-200 text-white print:text-black text-sm font-bold border-b border-gray-300 print:border-gray-400">
                        <div className="col-span-5 px-4 py-2 border-r border-[#004d00] print:border-gray-400">
                            Nombre
                        </div>
                        <div className="col-span-7 px-4 py-2">
                            Personal
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {organigramaFiltrado.map((dep, index) => (
                            <div 
                                key={dep.id} 
                                className={`grid grid-cols-12 text-sm border-b border-gray-200 print:border-gray-400 last:border-b-0 ${index % 2 === 0 ? 'bg-orange-50/30 print:bg-transparent' : 'bg-white print:bg-transparent'}`}
                            >
                                <div 
                                    className="col-span-5 px-4 py-3 flex items-start gap-2 border-r border-gray-200 print:border-gray-400"
                                    style={{ paddingLeft: `${(dep.nivel || 0) * 1.5 + 1}rem` }}
                                >
                                    <Users className="w-4 h-4 text-blue-600 print:text-black mt-0.5 shrink-0" />
                                    <span className={`text-gray-800 print:text-black ${dep.nivel === 0 ? 'font-bold' : ''}`}>
                                        {dep.nombre}
                                    </span>
                                </div>

                                <div className="col-span-7 px-4 py-3 bg-[#f5efe6]/40 print:bg-transparent">
                                    {verPersonal && dep.puestos_asignados && dep.puestos_asignados.length > 0 ? (
                                        <ul className="space-y-1">
                                            {dep.puestos_asignados.map((asignacion, i) => (
                                                <li key={i} className="text-gray-700 print:text-black leading-tight">
                                                    <span className="font-medium">
                                                        {asignacion.persona?.nombre} {asignacion.persona?.apellidos}
                                                    </span> 
                                                    <span className="text-gray-500 print:text-gray-600 text-xs ml-1">
                                                        ({asignacion.puesto?.nombre || 'Sin cargo asignado'})
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