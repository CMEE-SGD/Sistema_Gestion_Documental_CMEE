import { useNavigate } from 'react-router-dom';
import { Button } from "../../shared/components/atoms/button";

export default function AccesoDenegadoPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border-t-4 border-blue-900">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold text-blue-900 mb-2">
            Acceso Denegado
            </h2>
            
            <p className="text-gray-500 mb-8 text-sm">
            No tienes los permisos necesarios para visualizar este módulo o realizar esta acción.
            </p>

            {/* Único botón de salida hacia el Dashboard */}
            <Button 
            onClick={() => navigate('/welcome', { replace: true })} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
            >
            Volver al Inicio
            </Button>

        </div>
        </div>
    );
}