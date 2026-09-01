import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { logoCentro } from '../../assets';

export const AccesoPendientePage = () => {
  const navigate = useNavigate();
  const [comprobando, setComprobando] = useState(false);
  const [contador, setContador] = useState(0);

  const comprobar = async () => {
    setComprobando(true);
    try {
      // fetch directo (sin el interceptor de axios, que expulsaría al login
      // por el 401 mientras la sesión aún está pendiente). Si la sesión ya
      // fue aprobada, responde 200 y entramos.
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/', { replace: true });
        return;
      }
      const res = await fetch(
        `${(import.meta as any).env.VITE_API_URL}/usuarios/perfil/actual`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        navigate('/welcome', { replace: true });
      }
    } catch {
      // Todavía pendiente (401) → seguimos esperando.
    } finally {
      setComprobando(false);
    }
  };

  useEffect(() => {
    // Sondeo automático cada 15 s mientras la pantalla está abierta.
    comprobar();
    const id = setInterval(() => {
      setContador((c) => c + 1);
      comprobar();
    }, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cerrar = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(
        `${(import.meta as any).env.VITE_API_URL}/usuarios/logout`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      ).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <img src={logoCentro} alt="Logo CMEE" className="h-16 w-auto mx-auto mb-6" />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6 text-left">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-amber-800 mb-1">
              Acceso pendiente de aprobación
            </h2>
            <p className="text-xs text-amber-700 leading-relaxed">
              Su equipo se encuentra fuera del rango de IP autorizado. Un
              administrador debe aprobar su sesión antes de que pueda ingresar
              al sistema. Esta pantalla se actualiza automáticamente.
            </p>
          </div>
        </div>

        <button
          onClick={comprobar}
          disabled={comprobando}
          className="w-full h-11 bg-[#1e3a5f] hover:bg-[#16324d] text-white rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {comprobando ? 'Comprobando...' : `Comprobar aprobación ${contador > 0 ? `(${contador * 15}s)` : ''}`}
        </button>

        <button
          onClick={cerrar}
          className="w-full mt-3 h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Salir del sistema
        </button>
      </div>
    </div>
  );
};