import React from 'react';
import { useConfiguracionGeneral } from '../../hooks/useConfiguracionGeneral';
import { logoCentro } from '../../../assets';

interface PrintHeaderProps {
    tituloPrincipal?: string;
    subtitulo: string;
    filtroAplicado?: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({
    tituloPrincipal,
    subtitulo,
    filtroAplicado
}) => {
    const { nombreInstitucion } = useConfiguracionGeneral();
    return (
        <div className="hidden print:block mb-6 w-full">
            <div className="border-b-2 border-[#006600] pb-4 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{tituloPrincipal ?? nombreInstitucion}</h1>
                    <h2 className="text-lg text-gray-700 font-semibold mt-1">
                        {subtitulo}
                    </h2>
                </div>
                {/* Logo del centro (impresión) */}
                <div className="w-16 h-16 flex items-center justify-center">
                    <img
                        src={logoCentro}
                        alt="Logo CMEE"
                        className="w-full h-full object-contain"
                    />
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