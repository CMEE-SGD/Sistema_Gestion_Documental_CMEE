import { useState, useEffect } from 'react';
import { MonitorX, CheckCircle2, Clock3, LogOut, Search, Users } from 'lucide-react';
import api from '../../core/api/axios';
import { tienePermiso } from '../../shared/utils/auth';
import { useAlert } from '../../shared/components/molecules/AlertModal';
import { useToast } from '../../shared/components/molecules/Toast';

export const SesionesActivasPage = () => {
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [sesiones, setSesiones] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const puedeAdministrar = tienePermiso('Gestion de Usuarios', 5);

    useEffect(() => {
        if (!puedeAdministrar) return;
        let activo = true;
        const fetchSesiones = async (inicial = false) => {
            try {
                if (inicial) setCargando(true);
                const res = await api.get('/usuarios/sesiones');
                if (activo) setSesiones(res.data);
            } catch {
                console.error("Error al cargar sesiones activas");
            } finally {
                if (inicial && activo) setCargando(false);
            }
        };
        fetchSesiones(true);
        const intervalo = setInterval(() => fetchSesiones(false), 8000);
        return () => { activo = false; clearInterval(intervalo); };
    }, [puedeAdministrar]);

    const formatFecha = (fecha: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return fecha;
        return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleCerrarSesiones = async (usuario: any) => {
        const nombre = usuario?.persona?.nombre
            ? `${usuario.persona.nombre} ${usuario.persona.apellidos ?? ''}`.trim()
            : usuario?.nombre_usuario ?? 'este usuario';
        if (!await confirm({ message: `¿Cerrar todas las sesiones activas de ${nombre}? Se revocará su acceso al instante.` })) return;
        try {
            await api.post(`/usuarios/${usuario.id}/cerrar-sesiones`);
            setSesiones(sesiones.filter(s => s.usuario_id !== usuario.id));
            toast({ message: `Sesiones de ${nombre} cerradas correctamente.` });
        } catch {
            await alert({ message: "Error al cerrar las sesiones" });
        }
    };

    const handleAprobarSesion = async (sesion: any) => {
        const nombre = sesion?.usuario?.persona?.nombre
            ? `${sesion.usuario.persona.nombre} ${sesion.usuario.persona.apellidos ?? ''}`.trim()
            : sesion?.usuario?.nombre_usuario ?? 'este usuario';
        if (!await confirm({ message: `¿Aprobar la sesión de ${nombre} (${sesion.ip ?? 'IP desconocida'})? Solo esta sesión se autoriza; el próximo ingreso desde esa IP volverá a requerir aprobación.` })) return;
        try {
            await api.post(`/usuarios/sesiones/${sesion.id}/aprobar`);
            setSesiones(sesiones.map(s => s.id === sesion.id ? { ...s, en_espera: false, fecha_aprobacion: new Date().toISOString() } : s));
            toast({ message: `Sesión de ${nombre} aprobada. El usuario ya puede ingresar.` });
        } catch {
            await alert({ message: "Error al aprobar la sesión" });
        }
    };

    const sesionesFiltradas = sesiones.filter(s =>
        s.usuario?.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.usuario?.persona?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.usuario?.persona?.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.ip?.includes(busqueda)
    );

    const pendientes = sesionesFiltradas.filter(s => s.en_espera).length;
    const activas = sesionesFiltradas.length;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <MonitorX className="w-6 h-6 text-primary" />
                        Sesiones Activas
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Control de acceso en tiempo real. Las sesiones desde IPs fuera del rango quedan <strong>en espera</strong> hasta aprobación.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {pendientes > 0 && (
                        <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock3 className="w-3.5 h-3.5" />
                            {pendientes} en espera
                        </span>
                    )}
                    <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full border border-border">
                        {activas} sesión{activas !== 1 ? 'es' : ''} activa{activas !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por usuario, nombre o IP..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm min-w-max whitespace-nowrap">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Usuario</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">IP</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Inicio</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Expiración</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Estado</th>
                            {puedeAdministrar && (
                                <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {cargando ? (
                            <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Cargando sesiones...</td></tr>
                        ) : sesionesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="bg-muted p-3 rounded-full mb-3">
                                            <Users className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            {busqueda ? 'No hay sesiones que coincidan con la búsqueda' : 'No hay sesiones activas'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {busqueda ? 'Prueba con otros términos.' : 'Los usuarios que se conecten aparecerán aquí.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sesionesFiltradas.map(sesion => (
                                <tr key={sesion.id} className={`transition-colors hover:bg-muted/30 ${sesion.en_espera ? 'bg-amber-50/40' : ''}`}>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-foreground">{sesion.usuario?.nombre_usuario}</span>
                                        <span className="block text-xs text-muted-foreground">
                                            {sesion.usuario?.persona
                                                ? `${sesion.usuario.persona.apellidos}, ${sesion.usuario.persona.nombre}`
                                                : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                            {sesion.ip ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{formatFecha(sesion.fecha_inicio)}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{formatFecha(sesion.fecha_expiracion)}</td>
                                    <td className="px-6 py-4">
                                        {sesion.en_espera ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-100 text-amber-700">
                                                <Clock3 className="w-3 h-3" />
                                                En espera
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Activa
                                            </span>
                                        )}
                                    </td>
                                    {puedeAdministrar && (
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-1">
                                                {sesion.en_espera && (
                                                    <button
                                                        onClick={() => handleAprobarSesion(sesion)}
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"
                                                        title="Aprobar esta sesión"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCerrarSesiones(sesion.usuario)}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                                                    title="Cerrar todas las sesiones de este usuario"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
