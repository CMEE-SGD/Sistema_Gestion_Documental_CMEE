import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User as UserIcon,
    IdCard,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    ClipboardList,
    Contact,
    Save,
    KeyRound,
} from 'lucide-react';
import api from '../../core/api/axios';
import Navbar from '../../shared/components/organisms/Navbar';
import PrintHeader from '../../shared/components/organisms/PrintHeader';
import DataRow from '../rrhh/components/DataRow';
import { Button } from '../../shared/components/atoms/button';
import { useToast } from '../../shared/components/molecules/Toast';
import { useAuth } from '../../shared/hooks/useAuth';
import { buildFileUrl } from '../../shared/utils/backendUrl';

const IDIOMAS = ['Español (Ecuador)', 'English'];

const formatearFecha = (fecha?: string) => {
    if (!fecha) return '-';
    if (fecha.includes('T')) {
        const [year, month, day] = fecha.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }
    return fecha;
};

const htmlVacio = (html?: string) => {
    const limpio = (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return limpio.length === 0;
};

const Bloque = ({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) => (
    <section className="mb-8 print:break-inside-avoid">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <span className="text-gray-700">{icono}</span>
            <h3 className="font-bold text-[12px] text-gray-900 uppercase tracking-wide">{titulo}</h3>
        </div>
        {children}
    </section>
);

export const MiPerfilPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [idioma, setIdioma] = useState('Español (Ecuador)');
    const [guardandoIdioma, setGuardandoIdioma] = useState(false);

    const [claveActual, setClaveActual] = useState('');
    const [claveNueva, setClaveNueva] = useState('');
    const [confirmarClaveNueva, setConfirmarClaveNueva] = useState('');
    const [errorClave, setErrorClave] = useState('');
    const [guardandoClave, setGuardandoClave] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/usuarios/perfil/actual');
                const personaId = res.data?.persona?.id ?? (res.data as any)?.persona_id;
                let persona = res.data?.persona ?? null;

                // El endpoint de perfil trae la persona resumida (nombre, foto y
                // puesto); para la ficha completa se consulta /personas/mi-perfil,
                // que es de autoservicio (no exige permiso de RRHH) e incluye
                // todos los puestos asignados con sus responsabilidades.
                if (personaId) {
                    try {
                        const resPersona = await api.get('/personas/mi-perfil');
                        persona = resPersona.data;
                    } catch {
                        console.error('No se pudo cargar la ficha completa de la persona');
                    }
                }

                setPerfil({ ...res.data, persona });
                setIdioma(res.data?.idioma || 'Español (Ecuador)');
            } catch (error) {
                console.error('Error al cargar el perfil', error);
                setPerfil({ ...(user ?? {}), persona: user?.persona ?? null });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const handleGuardarIdioma = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardandoIdioma(true);
        try {
            await api.patch('/usuarios/perfil/actual', { idioma });
            toast({ message: 'Idioma actualizado correctamente.' });
        } catch (error) {
            console.error('Error al actualizar el idioma', error);
            toast({ message: 'No se pudo actualizar el idioma.' });
        } finally {
            setGuardandoIdioma(false);
        }
    };

    const handleCambiarClave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorClave('');

        if (claveNueva !== confirmarClaveNueva) {
            setErrorClave('Las contraseñas nuevas no coinciden.');
            return;
        }
        if (claveNueva.length < 6) {
            setErrorClave('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setGuardandoClave(true);
        try {
            await api.patch('/usuarios/perfil/actual', {
                clave_actual: claveActual,
                clave_nueva: claveNueva,
            });
            toast({ message: 'Contraseña actualizada correctamente.' });
            setClaveActual('');
            setClaveNueva('');
            setConfirmarClaveNueva('');
        } catch (error: any) {
            setErrorClave(
                error?.response?.data?.message || 'No se pudo cambiar la contraseña.',
            );
        } finally {
            setGuardandoClave(false);
        }
    };

    const persona = perfil?.persona;
    const avatarUrl = buildFileUrl(persona?.foto_ruta);

    const puestosActivos = (persona?.puestos ?? []).filter((p: any) => p.activo !== false);

    if (loading) {
        return (
            <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
                <Navbar />
                <div className="p-8 text-sm text-gray-500">Cargando mi perfil...</div>
            </div>
        );
    }

    if (!persona) {
        return (
            <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
                <Navbar />
                <div className="p-8 text-sm text-red-500">No se encontró la información del perfil.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
            <Navbar />

            <PrintHeader subtitulo={`Ficha del usuario: ${persona.nombre ?? ''} ${persona.apellidos ?? ''}`} />

            <div className="flex flex-col bg-white flex-grow m-4 shadow-sm border border-gray-200 rounded max-w-4xl mx-auto w-full print:border-none print:shadow-none print:m-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 print:hidden">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h1 className="text-sm font-bold text-gray-800">Mi Perfil</h1>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-300 bg-gray-50 print:hidden">
                    <Button variant="clasico" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-3 h-3 mr-1" /> Atrás
                    </Button>
                    <Button onClick={() => navigate('/preferencias')} variant="clasico">Preferencias</Button>
                    <Button variant="imprimir" />
                </div>

                <div className="p-6 print:p-0 print:my-6">
                    <div className="border border-gray-300 bg-white shadow-sm print:shadow-none print:border print:border-gray-400 rounded-sm">
                        <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                            {persona.nombre} {persona.apellidos}
                        </div>

                        <div className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px] p-8 print:bg-white print:border-none print:px-6 print:py-8">

                            {/* 1. FOTO Y DATOS PRINCIPALES */}
                            <div className="flex flex-col md:flex-row print:flex-row gap-8 mb-8">
                                <div className="w-[130px] h-[160px] shrink-0 border border-gray-300 print:border-gray-400 bg-[#e2e6ea] print:bg-transparent flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Foto perfil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-16 h-16 text-gray-400 stroke-[1.5]" />
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-start pt-1">
                                    <DataRow label="Grado" value={persona.grado} />
                                    <DataRow label="Nombre" value={persona.nombre} />
                                    <DataRow label="Apellidos" value={persona.apellidos} />
                                    <DataRow label="Usuario" value={perfil?.nombre_usuario} />
                                    <DataRow label="Estado" value={persona.estado ?? (persona.activo ? 'Activo' : 'Inactivo')} />
                                </div>
                            </div>

                            {/* 2. INFORMACIÓN PERSONAL */}
                            <Bloque icono={<Contact className="w-4 h-4" />} titulo="Información Personal">
                                <DataRow label="C.I." value={persona.cedula_identidad} />
                                <DataRow label="Fecha de nacimiento" value={formatearFecha(persona.fecha_nacimiento)} />
                                <DataRow label="Sexo" value={persona.sexo === 'M' ? 'Masculino' : persona.sexo === 'F' ? 'Femenino' : persona.sexo === 'O' ? 'Otros' : '-'} />
                                <DataRow label="Domicilio" value={persona.domicilio} />
                                <DataRow label="Ciudad" value={persona.ciudad} />
                                <DataRow label="Provincia" value={persona.provincia} />
                                <div className="h-4" />
                                <DataRow label="Celular 1" value={persona.celular_1 ?? persona.celular} />
                                <DataRow label="Celular 2" value={persona.celular_2} />
                            </Bloque>

                            {/* 3. CONTACTO */}
                            <Bloque icono={<Mail className="w-4 h-4" />} titulo="Contacto">
                                <DataRow label="E-mail 1">
                                    {persona.email_1
                                        ? <a href={`mailto:${persona.email_1}`} className="text-blue-600 underline">{persona.email_1}</a>
                                        : '-'}
                                </DataRow>
                                {persona.email_2 && (
                                    <DataRow label="E-mail 2">
                                        <a href={`mailto:${persona.email_2}`} className="text-blue-600 underline">{persona.email_2}</a>
                                    </DataRow>
                                )}
                            </Bloque>

                            {/* 4. RESPONSABILIDADES POR PUESTO */}
                            <Bloque icono={<Briefcase className="w-4 h-4" />} titulo="Puestos y Responsabilidades">
                                {puestosActivos.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        {puestosActivos.map((rel: any, idx: number) => (
                                            <div key={rel.id ?? idx} className="bg-white border border-gray-300 rounded-sm print:break-inside-avoid">
                                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 print:bg-transparent">
                                                    <Briefcase className="w-3.5 h-3.5 text-blue-800 print:text-black" />
                                                    <span className="font-bold text-gray-900">
                                                        {rel.puesto?.nombre ?? 'Puesto no asignado'}
                                                    </span>
                                                    {rel.puesto?.codigo && (
                                                        <span className="text-gray-500">({rel.puesto.codigo})</span>
                                                    )}
                                                    {rel.departamento?.nombre && (
                                                        <span className="text-gray-600">· {rel.departamento.nombre}</span>
                                                    )}
                                                </div>

                                                <div className="px-3 py-2">
                                                    <div className="flex items-center gap-1.5 mb-1.5 text-gray-700">
                                                        <ClipboardList className="w-3.5 h-3.5" />
                                                        <span className="font-bold text-[11px]">Responsabilidades:</span>
                                                    </div>
                                                    {htmlVacio(rel.puesto?.responsabilidades) ? (
                                                        <span className="text-gray-500 italic">
                                                            No hay responsabilidades registradas para este puesto.
                                                        </span>
                                                    ) : (
                                                        <div
                                                            className="text-gray-800 max-w-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2"
                                                            dangerouslySetInnerHTML={{ __html: rel.puesto.responsabilidades }}
                                                        />
                                                    )}
                                                </div>

                                                {!htmlVacio(rel.puesto?.funcion_principal) && (
                                                    <div className="px-3 py-2 border-t border-gray-100">
                                                        <div className="font-bold text-[11px] text-gray-700 mb-1">Función principal:</div>
                                                        <div
                                                            className="text-gray-800 max-w-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2"
                                                            dangerouslySetInnerHTML={{ __html: rel.puesto.funcion_principal }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500 italic">No tiene puestos asignados.</span>
                                )}
                            </Bloque>

                            {/* 5. DATOS DEL SISTEMA */}
                            <Bloque icono={<IdCard className="w-4 h-4" />} titulo="Datos de Usuario">
                                <DataRow label="Nombre de usuario" value={perfil?.nombre_usuario} />
                                <DataRow label="Perfil">
                                    {perfil?.grupos && perfil.grupos.length > 0
                                        ? perfil.grupos.map((g: any) => g.nombre).join(', ')
                                        : '-'}
                                </DataRow>
                                <DataRow label="Fecha de alta" value={formatearFecha(persona.fecha_alta)} />
                                <DataRow label="Tipo de recurso" value={persona.tipo_recurso || 'Usuario del sistema'} />
                            </Bloque>

                            {/* 6. MIS DATOS DE CONTACTO (editable: idioma y contraseña) */}
                            <div className="mt-10 border-t border-gray-300 pt-6 print:hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <h3 className="font-bold text-[12px] text-gray-900 uppercase tracking-wide">Configuración de mi cuenta</h3>
                                </div>

                                <form onSubmit={handleGuardarIdioma} className="flex flex-col gap-3 max-w-md">
                                    <label className="block text-xs font-semibold text-gray-700">Idioma</label>
                                    <select
                                        value={idioma}
                                        onChange={(e) => setIdioma(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    >
                                        {IDIOMAS.map((i) => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </select>
                                    <div>
                                        <Button type="submit" variant="clasico" disabled={guardandoIdioma}>
                                            <Save className="w-3 h-3 mr-1" />
                                            {guardandoIdioma ? 'Guardando...' : 'Guardar idioma'}
                                        </Button>
                                    </div>
                                </form>

                                <form onSubmit={handleCambiarClave} className="flex flex-col gap-3 pt-6 mt-6 border-t border-gray-200 max-w-md">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <KeyRound className="w-4 h-4 text-primary" />
                                        Cambiar mi contraseña
                                    </h2>

                                    {errorClave && (
                                        <p className="text-xs text-red-600 font-medium">{errorClave}</p>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña actual</label>
                                        <input
                                            type="password"
                                            value={claveActual}
                                            onChange={(e) => setClaveActual(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nueva contraseña</label>
                                        <input
                                            type="password"
                                            value={claveNueva}
                                            onChange={(e) => setClaveNueva(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Confirmar nueva contraseña</label>
                                        <input
                                            type="password"
                                            value={confirmarClaveNueva}
                                            onChange={(e) => setConfirmarClaveNueva(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <Button type="submit" variant="clasico" disabled={guardandoClave}>
                                            <Save className="w-3 h-3 mr-1" />
                                            {guardandoClave ? 'Guardando...' : 'Cambiar contraseña'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiPerfilPage;
