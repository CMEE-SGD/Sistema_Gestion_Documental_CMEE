import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';

export const NuevoCircuitoPage = () => {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [activo, setActivo] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            alert('El nombre del circuito es obligatorio');
            return;
        }

        try {
            setLoading(true);
            await api.post('/circuitos', { 
                nombre: nombre.toUpperCase(), // Lo guardamos en mayúsculas por convención
                activo 
            });
            
            // Regresamos a la tabla de circuitos
            navigate(-1); 
        } catch (error) {
            console.error("Error al crear circuito:", error);
            alert("Hubo un error al guardar. Es posible que este nombre de circuito ya exista.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-2xl">
            <h2 className="text-[18px] font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                Nuevo Circuito
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <label className="text-sm font-bold text-gray-700">Nombre del circuito:</label>
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="border-2 border-gray-800 rounded px-3 py-1.5 outline-none focus:border-blue-600 font-semibold uppercase text-sm"
                        placeholder="Ej: CALIDAD"
                        required
                    />
                </div>

                <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <label className="text-sm font-bold text-gray-700">Estado:</label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 w-max">
                        <input 
                            type="checkbox" 
                            checked={activo}
                            onChange={(e) => setActivo(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        Activo
                    </label>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Aceptar'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    );
};