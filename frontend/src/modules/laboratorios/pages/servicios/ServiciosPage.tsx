import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios'; 
import { Button } from '../../../../shared/components/atoms/button';

export const ServiciosPage = () => {
    const navigate = useNavigate();
    const [servicios, setServicios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await api.get('/servicios');
                setServicios(response.data);
            } catch (error) {
                console.error('Error cargando servicios', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServicios();
    }, []);

    const filtrados = servicios.filter(srv => 
        (srv.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (srv.magnitud || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Catálogo de Servicios</h1>
                    <p className="text-sm text-gray-500">Magnitudes y servicios de calibración ofertados</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="clasico" onClick={() => navigate('/laboratorios')}>Ver Laboratorios</Button>
                    <button 
                        onClick={() => navigate('/laboratorios/servicios/nuevo')}
                        className="px-4 py-2 bg-[#006400] text-white font-medium rounded-md hover:bg-green-800 transition-colors shadow-sm"
                    >
                        + Nuevo Servicio
                    </button>
                </div>
            </div>

            <div className="mb-4 flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar por servicio o magnitud..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Servicio de Calibración</th>
                            <th className="px-6 py-4 font-semibold">Magnitud</th>
                            <th className="px-6 py-4 font-semibold">Laboratorio Ejecutor</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">No se encontraron servicios.</td></tr>
                        ) : (
                            filtrados.map(srv => (
                                <tr key={srv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{srv.nombre}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded border border-purple-100">
                                            {srv.magnitud || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {srv.laboratorio?.nombre || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${srv.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {srv.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};