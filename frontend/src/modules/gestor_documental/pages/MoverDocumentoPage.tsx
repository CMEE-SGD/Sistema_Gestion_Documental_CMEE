import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FolderOutput, ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

export const MoverDocumentosPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { confirm } = useAlert();
    const { toast } = useToast();
    
    // Recibimos los documentos que el usuario seleccionó en la tabla
    const documentosAMover = location.state?.documentos || [];

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados para los combos en cascada
    const [libreriaId, setLibreriaId] = useState('');
    const [areaId, setAreaId] = useState('');
    const [subcarpetaId, setSubcarpetaId] = useState('');

    useEffect(() => {
        if (documentosAMover.length === 0) {
            navigate('/gestordocumental');
            return;
        }

        const fetchCarpetas = async () => {
            try {
                const res = await api.get('/carpetas');
                setCarpetas(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Error cargando carpetas:', err);
                setError('Error al cargar la estructura de carpetas.');
            }
        };
        fetchCarpetas();
    }, [documentosAMover, navigate]);

    // Filtros de primer nivel
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA');
    const areas = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(libreriaId));
    
    // 👉 MAGIA RECURSIVA: Función para obtener todos los niveles de subcarpetas
    const obtenerSubcarpetasAnidadas = (parentId: number, depth: number = 0): any[] => {
        // Buscamos los hijos directos del padre actual
        const hijos = carpetas.filter(c => c.carpeta_padre_id === parentId);
        let resultado: any[] = [];

        hijos.forEach(hijo => {
            // Guardamos el hijo y le inyectamos su nivel de profundidad
            resultado.push({ ...hijo, depth });
            // Buscamos a los hijos de este hijo y los concatenamos
            resultado = resultado.concat(obtenerSubcarpetasAnidadas(hijo.id, depth + 1));
        });

        return resultado;
    };

    // Ejecutamos la recursividad solo si hay un Área seleccionada
    const subcarpetasEstructuradas = areaId ? obtenerSubcarpetasAnidadas(Number(areaId)) : [];

    const handleLibreriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLibreriaId(e.target.value);
        setAreaId('');
        setSubcarpetaId('');
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAreaId(e.target.value);
        setSubcarpetaId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const carpetaDestinoFinalId = subcarpetaId ? Number(subcarpetaId) : Number(areaId);

        if (!carpetaDestinoFinalId) {
            setError('Debe seleccionar al menos un Área de destino.');
            return;
        }

        const ok = await confirm({ message: `¿Mover ${documentosAMover.length} documento(s) a la carpeta seleccionada?` });
        if (!ok) return;

        setLoading(true);
        setError('');

        try {
            await Promise.all(
                documentosAMover.map((doc: any) => 
                    api.patch(`/documentos/${doc.id}`, { 
                        carpeta_id: carpetaDestinoFinalId 
                    })
                )
            );

            toast({ message: 'Documentos movidos correctamente' });
            window.dispatchEvent(new Event('refreshDocumentos'));
            navigate(-1);
        } catch (err) {
            console.error('Error al mover documentos:', err);
            setError('Ocurrió un error al intentar mover los documentos.');
        } finally {
            setLoading(false);
        }
    };

    const nombresDocumentos = documentosAMover.map((d: any) => d.nombre).join(', ');

    return (
        <div className="max-w-3xl mx-auto w-full bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mt-6 text-sm">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="p-2 bg-gray-700 rounded text-white">
                    <FolderOutput className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Mover documentos</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

                <div className="flex items-start gap-4 mb-2">
                    <label className="w-24 text-gray-700 mt-1 font-medium">Documentos:</label>
                    <div className="flex-1 text-gray-800 bg-gray-50 p-2 rounded border border-gray-200 uppercase text-xs font-semibold">
                        {nombresDocumentos}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="w-24 text-gray-700 font-medium">Librería:</label>
                    <select 
                        value={libreriaId} 
                        onChange={handleLibreriaChange} 
                        required
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="">Seleccione una librería...</option>
                        {librerias.map(lib => (
                            <option key={lib.id} value={lib.id}>{lib.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <label className="w-24 text-gray-700 font-medium">Área:</label>
                    <select 
                        value={areaId} 
                        onChange={handleAreaChange} 
                        required
                        disabled={!libreriaId}
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white disabled:bg-gray-100"
                    >
                        <option value="">Seleccione un área...</option>
                        {areas.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <label className="w-24 text-gray-700 font-medium">Carpeta:</label>
                    <select 
                        value={subcarpetaId} 
                        onChange={(e) => setSubcarpetaId(e.target.value)}
                        disabled={!areaId}
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white disabled:bg-gray-100"
                    >
                        <option value="">Seleccione una carpeta...</option>
                        
                        {/* 👉 RENDERIZADO DEL ÁRBOL PLANO */}
                        {subcarpetasEstructuradas.map(c => (
                            <option key={c.id} value={c.id}>
                                {/* \u00A0 es un espacio en blanco estricto. Lo multiplicamos por la profundidad */}
                                {'\u00A0'.repeat(c.depth * 4)}{c.nombre}
                            </option>
                        ))}
                        
                    </select>
                </div>

                <div className="flex items-center gap-3 mt-6 border-t border-gray-200 pt-6">
                    <button 
                        type="submit" disabled={loading}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Moviendo...' : 'Aceptar'}
                    </button>
                    <button 
                        type="button" onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    );
};