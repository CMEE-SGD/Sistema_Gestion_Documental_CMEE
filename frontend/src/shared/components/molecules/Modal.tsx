// src/shared/components/molecules/Modal.tsx
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Evitar scroll en el fondo cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
        document.body.style.overflow = 'hidden';
        } else {
        document.body.style.overflow = 'unset';
        }
        return () => {
        document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-md transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>
            
            {/* Contenido (Aquí irá el formulario) */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
            </div>
        </div>
        </div>
    );
};