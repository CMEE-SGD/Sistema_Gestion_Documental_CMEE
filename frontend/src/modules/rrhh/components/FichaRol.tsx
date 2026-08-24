import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { TablaHistorial } from '../../../shared/components/organisms/TablaHistorial';

interface FichaRolProps {
    rol: any;
    mostrarLogs: boolean;
    logsRol: any[];
    loadingLogs: boolean;
}

const DataRow = ({ label, value, className = "" }: { label: string, value?: string, className?: string }) => (
    <div className={`grid grid-cols-[250px_1fr] border-b border-gray-200 p-3 items-start ${className}`}>
        <span className="font-bold text-gray-800">{label}:</span>
        <span className="whitespace-pre-wrap text-gray-700">{value || '-'}</span>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-blue-50 text-[#8eb8d5] px-3 py-2 font-bold text-sm uppercase tracking-wider border-b border-gray-200">
        {title}
    </div>
);

const FichaRol = ({ rol, mostrarLogs, logsRol, loadingLogs }: FichaRolProps) => {
    return (
        <>
            <div className="border border-gray-300 shadow-sm text-sm bg-white">
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg">Información</div>
                <div className="bg-gray-50">
                    <DataRow label="Código" value={rol.codigo} />
                    <DataRow label="Nombre" value={rol.nombre} />
                    <DataRow label="Fecha última mod." value={new Date(rol.updatedAt).toLocaleDateString()} />
                    <DataRow label="Funciones" value={rol.funciones} />

                    <SectionHeader title="Educación" />
                    <DataRow label="Indispensable" value={rol.educacion_indispensable} />
                    <DataRow label="Deseable" value={rol.educacion_deseable} />

                    <SectionHeader title="Formación" />
                    <DataRow label="Indispensable" value={rol.formacion_indispensable} />
                    <DataRow label="Deseable" value={rol.formacion_deseable} />

                    <SectionHeader title="Capacidades y Competencias Personales" />
                    <DataRow label="Indispensable" value={rol.capacidades_indispensable} />
                    <DataRow label="Deseable" value={rol.capacidades_deseable} />

                    <SectionHeader title="Experiencia de Trabajo" />
                    <DataRow label="Indispensable" value={rol.experiencia_indispensable} />
                    <DataRow label="Deseable" value={rol.experiencia_deseable} />

                    <DataRow label="Orden" value={rol.orden?.toString()} className="print:hidden" />
                    <DataRow label="Estado" value={rol.activo ? 'Activo' : 'Inactivo'} />
                </div>
            </div>

            {mostrarLogs && (
                <div className="border border-gray-300 shadow-sm bg-white mt-2 p-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <ShieldAlert className="w-5 h-5 text-[#006400]" />
                        <h3 className="font-bold text-sm text-gray-900 uppercase">Log de actividades del rol</h3>
                    </div>
                    <TablaHistorial logs={logsRol} loading={loadingLogs} esGlobal={false} />
                </div>
            )}
        </>
    );
};

export default FichaRol;