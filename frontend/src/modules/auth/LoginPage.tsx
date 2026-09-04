import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../../shared/components/atoms/button";
import { users } from "../../shared/data/users";
import { logoCentro, fotosLogin } from "../../assets";
import api from "../../core/api/axios";
import LoginCarousel from "./components/LoginCarousel";
import { AlertCircle, Eye, EyeOff } from 'lucide-react'; // 👇 1. Importamos el ícono de alerta
import { useConfiguracionGeneral } from "../../shared/hooks/useConfiguracionGeneral";
import '@fontsource-variable/big-shoulders-display';
import '@fontsource/ibm-plex-mono/500.css';

const fontDisplay = { fontFamily: "'Big Shoulders Display Variable', sans-serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };

export default function LoginPage() {
  const { nombreInstitucion } = useConfiguracionGeneral();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 👇 2. Cambiamos error (string) por errores (arreglo de strings)
  const [errores, setErrores] = useState<string[]>([]); 
  const [loading, setLoading] = useState(false);
  // 👇 Bandera para mostrar el aviso de "usuario ya activo en otro dispositivo"
  const [sesionActivaExistente, setSesionActivaExistente] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setErrores([]);
    setSesionActivaExistente(false);
    setUsername("");
    setPassword("");
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]); // Limpiamos errores previos
    setSesionActivaExistente(false);
    setLoading(true);

    try {
      // 1. Intentar autenticación con el backend
      try {
        // La IP la calcula el backend a partir de X-Forwarded-For (ver
        // usuarios.controller.ts) — el navegador no puede reportar su
        // propia IP pública de forma confiable.
        const response = await api.post('/usuarios/login', {
          nombre_usuario: username,
          clave: password,
        });

        const resData = response.data;
        const personaRaw = resData.persona ?? {};

        let puestoExtraido = 'Puesto no asignado';
        if (Array.isArray(personaRaw.puestos) && personaRaw.puestos.length > 0) {
          const rel = personaRaw.puestos.find((r: any) => r.activo === true) ?? personaRaw.puestos[0];
          puestoExtraido = rel?.puesto?.nombre ?? puestoExtraido;
        }

        const laboratorioId = resData.laboratorio_id ?? null;

        const userData = {
          id: resData.id,
          persona_id: personaRaw.id ?? resData.persona_id,
          nombre_usuario: resData.nombre_usuario,
          rol: resData.rol || 'usuario',
          grupos: resData.grupos ?? [],
          laboratorio_id: laboratorioId,
          persona: {
            nombre: personaRaw.nombre ?? '',
            apellidos: personaRaw.apellidos ?? '',
            foto_ruta: personaRaw.foto_ruta ?? '',
            puesto: puestoExtraido,
          },
        };

        if (typeof personaRaw.puesto === 'string') {
          puestoExtraido = personaRaw.puesto;
        } else if (typeof personaRaw.cargo === 'string') {
          puestoExtraido = personaRaw.cargo;
        } else if (personaRaw.puestos && Array.isArray(personaRaw.puestos) && personaRaw.puestos.length > 0) {
          const relacionActiva = personaRaw.puestos.find((rel: any) => rel.activo === true) || personaRaw.puestos[0];
          if (relacionActiva?.puesto?.nombre) {
            puestoExtraido = relacionActiva.puesto.nombre;
          }
        } else if (personaRaw.persona_puesto && Array.isArray(personaRaw.persona_puesto)) {
          const relacionActiva = personaRaw.persona_puesto.find((rel: any) => rel.activo === true);
          if (relacionActiva?.puesto?.nombre) {
            puestoExtraido = relacionActiva.puesto.nombre;
          }
        }

        if (resData.acceso_pendiente) {
          // La sesión de esta IP está fuera de rango: guardamos el token
          // (se activará cuando el admin la apruebe) y vamos a la pantalla
          // de espera.
          localStorage.setItem('token', resData.token);
          localStorage.setItem('usuario', JSON.stringify({
            id: resData.id,
            nombre_usuario: resData.nombre_usuario,
          }));
          navigate('/espera', { replace: true });
          return;
        }

        // 4. Guardar y navegar
        localStorage.setItem('token', resData.token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        navigate('/welcome', { replace: true });
        return;

      } catch (backendError: any) {
        console.warn("⚠️ Error backend:", backendError);
        if (backendError.message !== 'Network Error' && backendError.response?.status !== 404) {
          
          // 👇 3. Procesamos el error del backend para ver si es arreglo o string
          const mensajeBackend = backendError.response?.data?.message;

          // Caso especial: el usuario ya tiene una sesión activa en otro
          // dispositivo. Mostramos un aviso específico con botón al índice.
          if (backendError.response?.status === 409 ||
              (typeof mensajeBackend === 'string' &&
               mensajeBackend.toLowerCase().includes('ya está activo'))) {
            setSesionActivaExistente(true);
            setErrores([]);
            setLoading(false);
            return;
          }

          if (Array.isArray(mensajeBackend)) {
            setErrores(mensajeBackend);
          } else {
            setErrores([mensajeBackend || "Error de conexión"]);
          }
          
          setLoading(false);
          return;
        }
      }

      // 5. Fallback: Usuarios quemados
      const localUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (localUser) {
        const localUserAny = localUser as any;
        const userData = {
          id: localUser.id,
          nombre_usuario: localUser.username,
          rol: localUserAny.rol || 'usuario',
          persona: {
            nombre: localUserAny.nombre || localUser.username || 'Usuario',
            apellidos: localUserAny.apellidos || '',
            cargo: localUserAny.cargo || localUserAny.puesto || 'Sin cargo',
            puesto: localUserAny.puesto || localUserAny.cargo || 'Sin puesto',
            avatar: localUserAny.avatar || localUserAny.foto || ''
          }
        };

        localStorage.setItem('token', `${localUser.id}-${localUser.username}`);
        localStorage.setItem('usuario', JSON.stringify(userData));
        navigate('/welcome');
      } else {
        setErrores(["Usuario o contraseña incorrectos"]); // 👇 Fallback error
      }

    } catch (err) {
      setErrores(["Error inesperado"]); // 👇 Error general
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0c1620]">
      <div className="flex h-full">

        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex w-[65%] relative overflow-hidden">
          <LoginCarousel imagenes={fotosLogin} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,16,24,0.55) 0%, rgba(9,16,24,0.1) 25%, rgba(9,16,24,0.2) 55%, rgba(9,16,24,0.88) 100%)",
            }}
          />
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <p style={fontMono} className="text-[#f0c563] text-xs tracking-[0.25em] uppercase mb-3">
              Calibración · Ensayos
            </p>
            <h2 style={fontDisplay} className="text-5xl font-extrabold uppercase leading-[0.95] mb-4">
              Sistema Informático
            </h2>
            <p className="text-[#93a7ba] text-lg max-w-lg">
              {nombreInstitucion}
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#101f33] to-[#0c1620] flex items-center justify-center px-4">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* ORBES DE LUZ: sin esto el vidrio no tiene nada que reflejar y se
              ve como un panel plano. También suavizan (desvanecen) la unión
              con el panel de la foto en vez de dejar un corte duro. */}
          <div className="pointer-events-none absolute -left-32 -top-24 w-[440px] h-[440px] rounded-full bg-[#dba62e]/25 blur-[110px]" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 w-[400px] h-[400px] rounded-full bg-[#4a7ba8]/25 blur-[110px]" />
          <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#f0c563]/10 blur-[100px]" />

          {/* TARJETA DE VIDRIO: solo el bloque de login tiene el efecto
              esmerilado + borde ámbar, el resto del panel se queda sólido. */}
          <div className="relative w-full max-w-md rounded-2xl border border-[#dba62e]/25 border-t-2 border-t-[#dba62e] bg-white/[0.08] backdrop-blur-xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)] px-8 py-10">
            {/* brillo de vidrio (reflejo diagonal) */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.05) 100%)",
              }}
            />

            {/* LOGO */}
            <div className="relative flex justify-center mb-6">
              <img
                src={logoCentro}
                alt="Logo CMEE"
                className="h-20 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
              />
            </div>

            {/* TITULO */}
            <div className="relative text-center mb-10">
              <h1 style={fontDisplay} className="text-4xl font-extrabold uppercase text-[#f4f1e8] mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-[#93a7ba]">
                Ingrese sus credenciales para continuar
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-[#dba62e] to-[#f0c563] rounded-full mx-auto mt-4" />
            </div>

            {sesionActivaExistente ? (
              /* 👇 AVISO: usuario ya activo en otro dispositivo */
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-amber-500/15 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#f0c563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#f0c563] mb-2">
                  El usuario ya está activo
                </h2>
                <p className="text-sm text-[#c3c9c2] mb-6">
                  Ya existe una sesión activa de este usuario en otro dispositivo.
                  Cierre la sesión anterior o espere unos minutos antes de volver a ingresar.
                </p>
                <Button
                  type="button"
                  onClick={resetForm}
                  className="w-full h-12 bg-gradient-to-b from-[#f0c563] to-[#dba62e] hover:brightness-105 text-[#1c1300] rounded-xl font-semibold"
                >
                  Volver al índice
                </Button>
              </div>
            ) : (
              /* FORMULARIO */
              <form onSubmit={handleLogin} className="space-y-5">

              {/* USUARIO */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#93a7ba]">
                  Usuario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526175]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0a1420]/60 border border-[#3d5470]/40 rounded-xl text-[#f4f1e8] placeholder:text-[#526175] focus:outline-none focus:ring-2 focus:ring-[#dba62e]/25 focus:border-[#dba62e] transition-all"
                  />
                </div>
              </div>

              {/* CONTRASEÑA */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[#93a7ba]">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526175]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // Edge/IE inyectan su propio ícono de "mostrar contraseña"
                    // (::-ms-reveal) dentro de todo <input type="password">,
                    // que se sumaba al botón de abajo y aparecían dos ojos.
                    className="w-full pl-10 pr-12 py-3 bg-[#0a1420]/60 border border-[#3d5470]/40 rounded-xl text-[#f4f1e8] placeholder:text-[#526175] focus:outline-none focus:ring-2 focus:ring-[#dba62e]/25 focus:border-[#dba62e] transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526175] hover:text-[#f0c563]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 👇 4. NUEVO DISEÑO DE ERRORES */}
              {errores.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 w-full animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-rose-300 mb-1">
                      No se pudo iniciar sesión
                    </h3>
                    <ul className="text-sm text-rose-200 font-medium space-y-1">
                      {errores.map((err, index) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">•</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* BOTON */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-b from-[#f0c563] to-[#dba62e] hover:brightness-105 text-[#1c1300] rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Validando..." : "Acceder"}
              </Button>

            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}