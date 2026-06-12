import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../core/api/axios';
import { TablaHistorial } from '../../shared/components/organisms/TablaHistorial';
import Navbar from '../../shared/components/organisms/Navbar'; // 👇 Importamos el Navbar

export const AuditoriaPage = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/auditoria');
            setLogs(response.data);
        } catch (error) {
            console.error('Error cargando la auditoría', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
            {/* 👇 Añadimos el Navbar en la parte superior */}
            <Navbar />
            
            <div className="flex flex-col bg-white flex-grow m-4 shadow-sm border border-gray-200 rounded">
                {/* Cabecera */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h1 className="text-sm font-bold text-gray-800">
                        Bitácora de Accesos y Auditoría Global
                    </h1>
                </div>

                {/* Barra de herramientas */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-300 bg-gray-50">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        <ArrowLeft className="w-3 h-3" /> Atrás
                    </button>
                    <button 
                        onClick={fetchLogs}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        <RefreshCw className="w-3 h-3" /> Actualizar Listado
                    </button>
                </div>

                {/* Inyección del componente reutilizable (Modo Global) */}
                <div className="p-4">
                    <TablaHistorial logs={logs} loading={loading} esGlobal={true} />
                </div>
            </div>
        </div>
    );
};