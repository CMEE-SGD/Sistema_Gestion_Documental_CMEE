import React from 'react';
import { Printer } from 'lucide-react';
// IMPORTANTE: Ajusta esta ruta según donde tengas tu componente Button
import { Button } from '../ui/button'; 

interface PrintButtonProps {
    texto?: string; // Opcional, por si alguna vez quieres que diga "Imprimir reporte"
}

export const PrintButton: React.FC<PrintButtonProps> = ({ texto = "Imprimir" }) => {
    
    // La lógica de impresión se queda encapsulada aquí adentro
    const handleImprimir = () => {
        window.print();
    };

    return (
        <Button variant="clasico" onClick={handleImprimir}>
            <Printer className="w-4 h-4 mr-1 inline-block" /> 
            {texto}
        </Button>
    );
};