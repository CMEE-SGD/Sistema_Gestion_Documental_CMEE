import React from 'react';

// Subcomponente interno para no repetir código de filas
const DataRow = ({ label, value, className = "", hiddenPrint = false }: { label: string, value: any, className?: string, hiddenPrint?: boolean }) => (
    <div className={`grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center ${className} ${hiddenPrint ? 'print:hidden' : ''}`}>
        <span className="font-bold">{label}:</span>
        <span>{value}</span>
    </div>
);

export const FichaGrupo = ({ departamento }: { departamento: any }) => (
    <div className="border border-gray-300 shadow-sm text-sm bg-white print:shadow-none print:border-gray-400 print:mt-4">
        <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
            Información del grupo de organización
        </div>

        <div className="bg-gray-50 print:bg-white">
            <DataRow label="Nombre" value={departamento.nombre} />
            <DataRow label="Descripción" value={departamento.descripcion || '-'} />
            <DataRow label="Código" value={departamento.codigo || '-'} />
            <DataRow label="Orden" value={departamento.orden} hiddenPrint />
            <DataRow label="Tipo" value={departamento.tipo || 'Departamento'} />
            <DataRow label="Grupo enlazado" value={departamento.padre?.nombre || '-'} />
            <DataRow label="Responsable" value={departamento.responsable ? `${departamento.responsable.nombre} ${departamento.responsable.apellidos}` : '-'} />
            
            <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                <span className="font-bold">Estado:</span>
                <span className={departamento.activo ? 'text-green-700 print:text-black font-medium' : 'text-red-600 print:text-black font-medium'}>
                    {departamento.activo ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {/* Recursos asignados */}
            <div className="grid grid-cols-[180px_1fr] p-3 items-start">
                <span className="font-bold mt-1">Recursos asignados:</span>
                <div>
                    {departamento.puestos_asignados?.length > 0 ? (
                        <ul className="flex flex-col gap-1.5">
                            {departamento.puestos_asignados.map((asignacion: any, i: number) => (
                                <li key={i} className="text-gray-800 print:text-black leading-tight flex flex-col sm:flex-row sm:items-center gap-1">
                                    <span className="font-medium">• {asignacion.persona?.apellidos} {asignacion.persona?.nombre}</span>
                                    <span className="text-gray-500 print:text-gray-700 text-xs">- {asignacion.puesto?.nombre || 'Sin cargo asignado'}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-gray-500 italic text-sm">No hay personal asignado a este grupo.</span>
                    )}
                </div>
            </div>
        </div>
    </div>
);