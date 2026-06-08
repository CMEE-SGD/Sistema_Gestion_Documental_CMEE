import React from 'react';

interface PrintHeaderProps {
    tituloPrincipal?: string;
    subtitulo: string;
    filtroAplicado?: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ 
    tituloPrincipal = 'Centro de Metrología del Ejército Ecuatoriano', 
    subtitulo, 
    filtroAplicado 
}) => {
    return (
        <div className="hidden print:block mb-6 w-full">
            <div className="border-b-2 border-[#006600] pb-4 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{tituloPrincipal}</h1>
                    <h2 className="text-lg text-gray-700 font-semibold mt-1">
                        {subtitulo}
                    </h2>
                </div>
                {/* Contenedor del Logo */}
                <div className="w-16 h-16 bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-500 rounded-full">
                    LOGO
                </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>
                    {filtroAplicado && (
                        <><strong>Filtro aplicado:</strong> {filtroAplicado.toUpperCase()}</>
                    )}
                </span>
                <span><strong>Fecha de impresión:</strong> {new Date().toLocaleDateString('es-EC')}</span>
            </div>
        </div>
    );
};

export default PrintHeader;