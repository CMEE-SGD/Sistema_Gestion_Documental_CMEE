import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';

export const LaboratoriosPage = () => {
    const navigate = useNavigate();
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const fetchLaboratorios = async () => {
            try {
                const response = await api.get('/laboratorios');
                setLaboratorios(response.data);
            } catch (error) {
                console.error('Error cargando laboratorios', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLaboratorios();
    }, []);

    const filtrados = laboratorios.filter(lab => 
        (lab.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (lab.codigo || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laboratorios</h1>
                    <p className="text-sm text-gray-500">Gestión de laboratorios acreditados del Centro de Metrología</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="clasico" onClick={() => navigate('/welcome')}>
                        Volver al Inicio
                    </Button>
                    <Button variant="submit" onClick={() => navigate('/laboratorios/nuevo')}>
                        + Nuevo Laboratorio
                    </Button>
                </div>
            </div>

            {/* Barra de Búsqueda */}
            <div className="mb-4 flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Tabla Limpia */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Código</th>
                            <th className="px-6 py-4 font-semibold">Laboratorio</th>
                            <th className="px-6 py-4 font-semibold">Responsable Técnico</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado</th>
                            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron laboratorios.</td></tr>
                        ) : (
                            filtrados.map(lab => (
                                <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{lab.codigo || '-'}</td>
                                    <td className="px-6 py-4">{lab.nombre}</td>
                                    <td className="px-6 py-4">
                                        {lab.responsable ? `${lab.responsable.nombre} ${lab.responsable.apellidos}` : <span className="text-gray-400 italic">Sin asignar</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${lab.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {lab.activo ? 'Operativo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => navigate(`/laboratorios/${lab.id}`)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Administrar
                                        </button>
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