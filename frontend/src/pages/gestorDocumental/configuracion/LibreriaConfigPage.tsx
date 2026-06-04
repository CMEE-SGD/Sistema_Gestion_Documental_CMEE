import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export const LibreriasConfigPage = () => {
    const [librerias, setLibrerias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                const todas = Array.isArray(res.data) ? res.data : [];
                setLibrerias(todas.filter(c => c.tipo === 'LIBRERIA'));
            } catch (error) {
                console.error("Error al cargar librerías:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                Administración de Librerías
            </h2>
            
            {loading ? (
                <div className="text-gray-500">Cargando...</div>
            ) : librerias.length === 0 ? (
                <div className="text-gray-500 italic">No hay librerías registradas.</div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded">
                    <table className="w-full text-left text-sm text-gray-800">
                        <thead className="bg-gray-100 font-bold text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Código</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {librerias.map(item => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3">{item.id}</td>
                                    <td className="p-3 font-semibold">{item.nombre}</td>
                                    <td className="p-3">{item.codigo || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button className="text-blue-600 hover:underline text-xs mr-3">Editar</button>
                                        <button className="text-red-600 hover:underline text-xs">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};