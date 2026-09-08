import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import { GraduationCap, FileText, Upload, Plus } from 'lucide-react';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { encodeId, decodeId } from '../../../../shared/utils/ids';
import { buildFileUrl } from '../../../../shared/utils/backendUrl';

const estadoColors: Record<string, string> = {
  PROGRAMADA: 'bg-yellow-100 text-yellow-800',
  EN_CURSO: 'bg-blue-100 text-blue-800',
  FINALIZADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export const CapacitacionesPersonaPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { confirm } = useAlert();
    const [persona, setPersona] = useState<any>(null);
    const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [personaRes, capsRes] = await Promise.all([
                    api.get(`/personas/${id}`),
                    api.get(`/capacitaciones/persona/${id}`),
                ]);
                setPersona(personaRes.data);
                setCapacitaciones(capsRes.data);
            } catch (error) {
                console.error('Error al cargar datos', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [id]);

    const handleSubirCertificado = async (capacitacionId: number, personaId: number, file: File) => {
        setUploading(prev => ({ ...prev, [capacitacionId]: true }));
        try {
            const fd = new FormData();
            fd.append('certificado', file);
            await api.post(`/capacitaciones/${capacitacionId}/certificado/${personaId}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast({ message: 'Certificado subido correctamente' });
            const res = await api.get(`/capacitaciones/persona/${id}`);
            setCapacitaciones(res.data);
        } catch (err: any) {
            toast({ message: err.response?.data?.message || 'Error al subir certificado' });
        } finally {
            setUploading(prev => ({ ...prev, [capacitacionId]: false }));
        }
    };

    if (loading) return <div className="p-8 text-center text-sm font-sans">Cargando...</div>;
    if (!persona) return <div className="p-8 text-center text-sm text-red-500 font-sans">Recurso no encontrado.</div>;

    return (
        <div className="bg-white min-h-screen font-sans">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 text-sm">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">
                    Capacitaciones: {persona.nombre} {persona.apellidos}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50">
                <Button onClick={() => navigate(`/rrhh/personas/${encodeId(id)}`)} variant="clasico">Atrás a la Ficha</Button>
                <Button onClick={() => navigate(`/rrhh/capacitaciones/nueva?persona=${encodeId(id)}`)} variant="clasico">
                    <Plus className="w-4 h-4 mr-1" /> Nueva Capacitación
                </Button>
            </div>

            <div className="p-4">
                <div className="border border-gray-300 shadow-sm">
                    <div className="bg-[#8eb8d5] text-white font-bold px-4 py-2 text-sm">
                        Capacitaciones en las que participa ({capacitaciones.length})
                    </div>
                    <div className="p-4 bg-white overflow-x-auto">
                        {capacitaciones.length === 0 ? (
                            <div className="text-gray-500 italic text-[12px] p-2">Esta persona no tiene capacitaciones registradas.</div>
                        ) : (
                            <table className="w-full text-left text-[12px] border-collapse min-w-[880px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-700">
                                        <th className="py-2.5 px-3 font-bold">Nombre</th>
                                        <th className="py-2.5 px-3 font-bold">Inicio</th>
                                        <th className="py-2.5 px-3 font-bold">Fin</th>
                                        <th className="py-2.5 px-3 font-bold">Horas</th>
                                        <th className="py-2.5 px-3 font-bold">Proveedor</th>
                                        <th className="py-2.5 px-3 font-bold">Estado</th>
                                        <th className="py-2.5 px-3 font-bold">Certificado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {capacitaciones.map((c: any) => {
                                        const participante = c.participantes?.find((p: any) => p.persona.id === Number(id));
                                        const certificado = participante?.certificado;
                                        const capId = c.id;
                                        return (
                                            <tr
                                                key={c.id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td
                                                    className="py-2.5 px-3 font-medium text-blue-800 cursor-pointer"
                                                    onClick={() => navigate(`/rrhh/capacitaciones/${encodeId(c.id)}`)}
                                                >
                                                    {c.nombre}
                                                </td>
                                                <td className="py-2.5 px-3">{new Date(c.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                                                <td className="py-2.5 px-3">{new Date(c.fecha_fin).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                                                <td className="py-2.5 px-3">{c.horas}</td>
                                                <td className="py-2.5 px-3">{c.proveedor || '-'}</td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${estadoColors[c.estado] || 'bg-gray-100'}`}>
                                                        {c.estado?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        {certificado ? (
                                                            <a
                                                                href={buildFileUrl(certificado) ?? '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> Ver certificado
                                                            </a>
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400">Sin certificado</span>
                                                        )}
                                                        <label className={`flex items-center gap-1 text-[11px] cursor-pointer px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 ${uploading[capId] ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <Upload className="w-3 h-3" />
                                                            {uploading[capId] ? 'Subiendo...' : 'Editar'}
                                                            <input
                                                                type="file"
                                                                accept=".pdf"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    e.target.value = '';
                                                                    if (!file || !participante) return;
                                                                    if (certificado) {
                                                                        const ok = await confirm({ message: `${persona.nombre} ya tiene un certificado en esta capacitación. ¿Desea reemplazarlo?` });
                                                                        if (!ok) return;
                                                                    }
                                                                    handleSubirCertificado(capId, participante.persona.id, file);
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
