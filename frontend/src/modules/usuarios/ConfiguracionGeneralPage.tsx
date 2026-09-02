import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import api from '../../core/api/axios';
import { useToast } from '../../shared/components/molecules/Toast';

export const ConfiguracionGeneralPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [nombreInstitucion, setNombreInstitucion] = useState('');
    const [maxIntentosFallidosLogin, setMaxIntentosFallidosLogin] = useState(5);
    const [ipRangosPermitidos, setIpRangosPermitidos] = useState('');
    const [tiempoInactividadMinutos, setTiempoInactividadMinutos] = useState(20);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/configuracion-general');
                setNombreInstitucion(res.data.nombre_institucion);
                setMaxIntentosFallidosLogin(res.data.max_intentos_fallidos_login);
                setIpRangosPermitidos(res.data.ip_rangos_permitidos ?? '');
                setTiempoInactividadMinutos(res.data.tiempo_inactividad_minutos ?? 20);
            } catch (error) {
                console.error('Error al cargar la configuración general', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            await api.patch('/configuracion-general', {
                nombre_institucion: nombreInstitucion,
                max_intentos_fallidos_login: maxIntentosFallidosLogin,
                ip_rangos_permitidos: ipRangosPermitidos.trim(),
                tiempo_inactividad_minutos: tiempoInactividadMinutos,
            });
            toast({ message: 'Configuración general actualizada correctamente.' });
        } catch (error) {
            console.error('Error al guardar la configuración general', error);
            toast({ message: 'No se pudo guardar la configuración.' });
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-sm text-muted-foreground">Cargando configuración...</div>;
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Configuración General
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Parámetros institucionales y de seguridad del sistema.
                </p>
            </div>

            <form onSubmit={handleGuardar} className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Nombre de la institución
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                        Se muestra en la pantalla de inicio de sesión, la página de bienvenida y los encabezados de impresión.
                    </p>
                    <input
                        type="text"
                        value={nombreInstitucion}
                        onChange={(e) => setNombreInstitucion(e.target.value)}
                        required
                        maxLength={200}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Máximo de intentos fallidos de inicio de sesión
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                        Tras esta cantidad de intentos fallidos consecutivos, la cuenta se bloquea automáticamente y requiere que un administrador la desbloquee.
                    </p>
                    <input
                        type="number"
                        min={3}
                        max={20}
                        value={maxIntentosFallidosLogin}
                        onChange={(e) => setMaxIntentosFallidosLogin(Number(e.target.value))}
                        required
                        className="w-32 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Rangos de IP con acceso directo
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                        IPs o rangos (CIDR) autorizados a entrar directamente, uno por línea o separados por coma. Los usuarios que se conecten desde una IP fuera de estos rangos quedarán <strong>en espera</strong> hasta que un administrador apruebe su sesión desde "Usuarios → Sesiones Activas".
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                        Ejemplos: <code className="bg-muted px-1.5 py-0.5 rounded">192.168.1.0/24</code>, <code className="bg-muted px-1.5 py-0.5 rounded">10.0.0.5</code>. Dejar vacío desactiva la restricción (todo entra directo).
                    </p>
                    <textarea
                        value={ipRangosPermitidos}
                        onChange={(e) => setIpRangosPermitidos(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        placeholder={'192.168.1.0/24\n10.0.0.5'}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono resize-y"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Tiempo de inactividad (minutos)
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                        Si el usuario permanece inactivo dentro de la plataforma este tiempo (sin mover el ratón, teclado o hacer clic), su sesión se cierra automáticamente y debe volver a ingresar. <strong>0 desactiva</strong> el cierre por inactividad.
                    </p>
                    <input
                        type="number"
                        min={0}
                        max={180}
                        value={tiempoInactividadMinutos}
                        onChange={(e) => setTiempoInactividadMinutos(Number(e.target.value))}
                        required
                        className="w-32 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                    >
                        <Save className="w-4 h-4" />
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};
