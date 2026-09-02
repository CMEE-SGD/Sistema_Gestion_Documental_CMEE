import React from 'react';
import { User, Contact, ShieldAlert, BookOpen, UserCog, GraduationCap } from 'lucide-react';
import DataRow from './DataRow';
import { TablaHistorial } from '../../../shared/components/organisms/TablaHistorial';
import { buildFileUrl } from '../../../shared/utils/backendUrl';

interface DocumentoAdjunto {
    id: number;
    nombre_archivo: string;
    ruta: string;
}

interface CapacitacionItem {
    id: number;
    nombre: string;
    participantes: { persona: { id: number }; certificado?: string | null }[];
}

interface FichaPersonaProps {
    persona: any;
    documentos: DocumentoAdjunto[];
    capacitaciones: CapacitacionItem[];
    mostrarLogs: boolean;
    logsPersona: any[];
    loadingLogs: boolean;
}

const FichaPersona = ({ persona, documentos, capacitaciones, mostrarLogs, logsPersona, loadingLogs }: FichaPersonaProps) => {

    const formatFecha = (fecha?: string) => {
        if (!fecha) return '-';
        if (fecha.includes('T')) {
            const [year, month, day] = fecha.split('T')[0].split('-');
            return `${day}/${month}/${year}`;
        }
        return fecha;
    };

    return (
        <div className="border border-gray-300 bg-white shadow-sm print:shadow-none print:border print:border-gray-400 rounded-sm">
            <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                Usuario del sistema
            </div>

            <div className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px] p-8 print:bg-white print:border-none print:px-6 print:py-8">
                
                {/* 1. FOTO Y DATOS PRINCIPALES */}
                <div className="flex flex-col md:flex-row print:flex-row gap-8 mb-8">
                    <div className="w-[130px] h-[160px] shrink-0 border border-gray-300 print:border-gray-400 bg-[#e2e6ea] print:bg-transparent flex items-center justify-center overflow-hidden">
                        {persona.foto_ruta ? (
                            <img
                                src={buildFileUrl(persona.foto_ruta) ?? undefined} alt="Foto perfil"
                                className="w-full h-full object-cover"
                            />) : (
                            <User className="w-16 h-16 text-gray-400 stroke-[1.5]" />
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-start pt-1">
                        {/* 👇 Limpiado Código y Saludo, Agregado Grado */}
                        <DataRow label="Grado" value={persona.grado} />
                        <DataRow label="Nombre" value={persona.nombre} />
                        <DataRow label="Apellidos" value={persona.apellidos} />

                        <DataRow label="Puesto">
                            {persona.puestos && persona.puestos.filter((p: any) => p.activo !== false).length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    {persona.puestos.filter((p: any) => p.activo !== false).map((p: any, idx: number) => (
                                        <div key={idx} className="text-[11px] leading-tight">
                                            {p.puesto?.nombre && (
                                                <span className="text-blue-600 underline cursor-pointer font-medium mr-1 hover:text-blue-800">
                                                    {p.puesto.nombre}
                                                </span>
                                            )}
                                            {p.puesto?.nombre && p.departamento?.nombre && <span className="text-gray-600"> en </span>}
                                            {p.departamento?.nombre && (
                                                <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                                    el departamento {p.departamento.nombre}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : '-'}
                        </DataRow>

                        <DataRow label="Roles">
                            {persona.roles && persona.roles.length > 0 ? persona.roles.map((r: any) => r.nombre).join(', ') : '-'}
                        </DataRow>
                    </div>
                </div>

                {/* 2. DATOS DEL SISTEMA */}
                <div className="mb-10">
                    <DataRow label="Fecha de alta" value={formatFecha(persona.fecha_alta)} />
                    <DataRow label="Tipo de recurso" value={persona.tipo_recurso || 'Usuario del sistema'} />
                    {/* 👇 Cambiado a persona.estado */}
                    <DataRow label="Estado" value={persona.estado} />
                </div>

                {/* 3. INFORMACIÓN PERSONAL */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Contact className="w-4 h-4 text-gray-700" />
                        <h3 className="font-bold text-[12px] text-gray-900">Información Personal</h3>
                    </div>

                    <DataRow label="C.I." value={persona.cedula_identidad} />
                    <DataRow label="Fecha de nacimiento" value={formatFecha(persona.fecha_nacimiento)} />
                    <DataRow label="Sexo" value={persona.sexo === 'M' ? 'Masculino' : persona.sexo === 'F' ? 'Femenino' : persona.sexo === 'O' ? 'Otros' : '-'} />
                    <DataRow label="Domicilio" value={persona.domicilio} />
                    <DataRow label="Ciudad" value={persona.ciudad} />
                    <DataRow label="Provincia" value={persona.provincia} />

                    <div className="h-4"></div>

                    {/* 👇 Teléfonos actualizados */}
                    <DataRow label="Celular 1" value={persona.celular_1} />
                    <DataRow label="Celular 2" value={persona.celular_2} />

                    <div className="h-4"></div>

                    <DataRow label="E-mail 1">
                        {persona.email_1 ? <a href={`mailto:${persona.email_1}`} className="text-blue-600 underline">{persona.email_1}</a> : '-'}
                    </DataRow>
                    {persona.email_2 && (
                        <DataRow label="E-mail 2">
                            <a href={`mailto:${persona.email_2}`} className="text-blue-600 underline">{persona.email_2}</a>
                        </DataRow>
                    )}
                </div>

                {/* 4. DOCUMENTOS ADJUNTOS */}
                <div className="mb-8 mt-10">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-[#d9a05b]" fill="#f7e1b5" />
                        <h3 className="font-bold text-[12px] text-gray-900">Curriculum Vitae</h3>
                    </div>

                    <DataRow label="Documentos">
                        <div className="flex flex-col gap-2.5 max-w-4xl">
                            {documentos.length > 0 ? (
                                documentos.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-300 px-3 py-1.5 rounded-sm">
                                        <a
                                            href={buildFileUrl(doc.ruta) ?? undefined} target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline hover:text-blue-800 text-[11px]"
                                        >
                                            {doc.nombre_archivo}
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No hay documentos adjuntos.</span>
                            )}
                        </div>
                    </DataRow>
                </div>

                {/* 4b. CAPACITACIONES (desde el módulo de capacitaciones) */}
                <div className="mb-8 mt-10">
                    <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="w-4 h-4 text-[#8eb8d5]" />
                        <h3 className="font-bold text-[12px] text-gray-900">Capacitaciones</h3>
                    </div>

                    <DataRow label="Capacitaciones">
                        <div className="flex flex-col gap-1.5 max-w-4xl">
                            {capacitaciones.length > 0 ? (
                                capacitaciones.map((cap) => {
                                    const participante = cap.participantes?.find(
                                        (p) => p.persona.id === persona.id,
                                    );
                                    const certificado = participante?.certificado;
                                    const contenido = (
                                        <span className="text-blue-600 underline hover:text-blue-800 text-[11px]">
                                            {cap.nombre}
                                        </span>
                                    );
                                    const nombre = certificado ? (
                                        <a
                                            href={buildFileUrl(certificado) ?? undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {contenido}
                                        </a>
                                    ) : (
                                        contenido
                                    );
                                    return (
                                        <div key={cap.id} className="flex items-center justify-between bg-white border border-gray-300 px-3 py-1.5 rounded-sm">
                                            {nombre}
                                            {!certificado && (
                                                <span className="text-[10px] text-gray-400 italic">Sin certificado</span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-gray-500 italic">No hay capacitaciones registradas.</span>
                            )}
                        </div>
                    </DataRow>
                </div>

                {/* 5. DATOS DE USUARIO */}
                <div className="mb-8 mt-10">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCog className="w-4 h-4 text-blue-700" />
                        <h3 className="font-bold text-[12px] text-gray-900">Datos de usuario</h3>
                    </div>

                    <DataRow label="Nombre de usuario" value={persona.usuario?.nombre_usuario || '-'} />
                    <DataRow label="Perfil">
                        {persona.usuario?.grupos && persona.usuario.grupos.length > 0
                            ? persona.usuario.grupos.map((g: any) => g.nombre).join(', ')
                            : '-'}
                    </DataRow>
                    <DataRow label="Interfaz" value="SI-CMEE" />
                </div>

                {/* 6. LOGS DE AUDITORÍA */}
                {mostrarLogs && (
                    <div className="mt-10 border-t border-gray-300 pt-6 animate-fade-in print:hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-4 h-4 text-[#006400]" />
                            <h3 className="font-bold text-[12px] text-gray-900">Log de actividades del recurso</h3>
                        </div>
                        <TablaHistorial logs={logsPersona} loading={loadingLogs} esGlobal={false} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FichaPersona;