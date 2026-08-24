import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button'; 
import api from '../../../../core/api/axios';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import VistaPuestos from '../../components/VistaPuestos';
import { tienePermiso } from '../../../../shared/utils/auth'; // 👇 Importamos la función

export const PuestosPage = () => {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    const [vistaActual, setVistaActual] = useState<'tabla' | 'esquema'>('tabla');

    useEffect(() => {
        const fetchPuestos = async () => {
            try {
                const response = await api.get('/puestos');
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

    const puestosFiltrados = puestos.filter(puesto => {
        if (filtroEstado === 'activo' && !puesto.activo) return false;
        if (filtroEstado === 'inactivo' && puesto.activo) return false;
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoPuesto = `${puesto.nombre || ''} ${puesto.codigo || ''}`.toLowerCase();
            if (!textoPuesto.includes(busqueda)) return false;
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
                    
                    {/* 👇 Ocultamos creación */}
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button onClick={() => navigate('/rrhh/puestos/nuevo')} variant="clasico">Nuevo puesto</Button>
                    )}
                    
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

            <VistaPuestos 
                vistaActual={vistaActual}
                puestosFiltrados={puestosFiltrados}
                loading={loading}
            />
        </div>
    );
};