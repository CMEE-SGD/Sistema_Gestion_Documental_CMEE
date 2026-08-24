import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { Plus } from 'lucide-react';
import api from '../../../../core/api/axios';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import VistaRoles from '../../components/VistaRoles';
import { tienePermiso } from '../../../../shared/utils/auth'; // 👇 Importamos la función

export const RolesPage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    const [vistaActual, setVistaActual] = useState<'tabla' | 'esquema'>('tabla');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles');
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

    const rolesFiltrados = roles.filter(rol => {
        if (filtroEstado === 'activo' && !rol.activo) return false;
        if (filtroEstado === 'inactivo' && rol.activo) return false;
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoRol = `${rol.nombre || ''} ${rol.codigo || ''}`.toLowerCase();
            if (!textoRol.includes(busqueda)) return false;
        }
        return true; 
    });
    
    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">
            <PrintHeader 
                subtitulo={vistaActual === 'tabla' ? 'Listado General de Roles' : 'Esquema de Roles y Personal'}
                filtroAplicado={filtroEstado}
            />

            {vistaActual === 'tabla' ? (
                <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                    <Button onClick={() => navigate('/rrhh')} variant="clasico"> Atrás</Button>
                    
                    {/* 👇 Ocultamos creación */}
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button onClick={() => navigate('/rrhh/roles/nuevo')} variant="clasico">
                            <Plus className="w-4 h-4" /> Nuevo rol
                        </Button>
                    )}
                    
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

            <VistaRoles vistaActual={vistaActual} rolesFiltrados={rolesFiltrados} loading={loading} />
        </div>
    );
};