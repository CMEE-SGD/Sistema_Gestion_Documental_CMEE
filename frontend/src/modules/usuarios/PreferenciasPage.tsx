import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Save, KeyRound } from 'lucide-react';
import api from '../../core/api/axios';
import Navbar from '../../shared/components/organisms/Navbar';
import { useToast } from '../../shared/components/molecules/Toast';

const IDIOMAS = ['Español (Ecuador)', 'English'];

export const PreferenciasPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [guardandoIdioma, setGuardandoIdioma] = useState(false);
    const [guardandoClave, setGuardandoClave] = useState(false);

    const [idioma, setIdioma] = useState('Español (Ecuador)');

    const [claveActual, setClaveActual] = useState('');
    const [claveNueva, setClaveNueva] = useState('');
    const [confirmarClaveNueva, setConfirmarClaveNueva] = useState('');
    const [errorClave, setErrorClave] = useState('');

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await api.get('/usuarios/perfil/actual');
                setIdioma(res.data.idioma || 'Español (Ecuador)');
            } catch (error) {
                console.error('Error al cargar el perfil', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
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

    return (
        <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
            <Navbar />

            <div className="flex flex-col bg-white flex-grow m-4 shadow-sm border border-gray-200 rounded max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300">
                    <Settings className="w-5 h-5 text-primary" />
                    <h1 className="text-sm font-bold text-gray-800">Preferencias</h1>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-300 bg-gray-50">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        <ArrowLeft className="w-3 h-3" /> Atrás
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-sm text-muted-foreground">Cargando preferencias...</div>
                ) : (
                    <div className="p-6 flex flex-col gap-8">
                        <form onSubmit={handleGuardarIdioma} className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-foreground">Idioma</h2>
                            <select
                                value={idioma}
                                onChange={(e) => setIdioma(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {IDIOMAS.map((i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                            <div>
                                <button
                                    type="submit"
                                    disabled={guardandoIdioma}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {guardandoIdioma ? 'Guardando...' : 'Guardar idioma'}
                                </button>
                            </div>
                        </form>

                        <form onSubmit={handleCambiarClave} className="flex flex-col gap-3 pt-6 border-t border-border">
                            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-primary" />
                                Cambiar mi contraseña
                            </h2>

                            {errorClave && (
                                <p className="text-xs text-destructive font-medium">{errorClave}</p>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">Contraseña actual</label>
                                <input
                                    type="password"
                                    value={claveActual}
                                    onChange={(e) => setClaveActual(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">Nueva contraseña</label>
                                <input
                                    type="password"
                                    value={claveNueva}
                                    onChange={(e) => setClaveNueva(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    value={confirmarClaveNueva}
                                    onChange={(e) => setConfirmarClaveNueva(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={guardandoClave}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {guardandoClave ? 'Guardando...' : 'Cambiar contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
