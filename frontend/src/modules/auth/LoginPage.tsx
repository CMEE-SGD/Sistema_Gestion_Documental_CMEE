import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../../shared/components/atoms/button";
import { users } from "../../shared/data/users"; // Fallback a usuarios quemados
import { logoCentro } from "../../assets";
import { laboratorio } from "../../assets";
import api from "../../core/api/axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Intentar autenticación con el backend
      try {
        const response = await api.post('/usuarios/login', {
          nombre_usuario: username,
          clave: password
        });

        const resData = response.data;
        console.log("🔍 resData completo:", JSON.stringify(resData, null, 2));

        // persona siempre viene en resData.persona según tu backend
        const personaRaw = resData.persona ?? {};

        // Extraer puesto del array anidado de Prisma
        let puestoExtraido = 'Puesto no asignado';
        if (Array.isArray(personaRaw.puestos) && personaRaw.puestos.length > 0) {
          const rel = personaRaw.puestos.find((r: any) => r.activo === true) ?? personaRaw.puestos[0];
          puestoExtraido = rel?.puesto?.nombre ?? puestoExtraido;
        }

        const userData = {
          id: resData.id,
          nombre_usuario: resData.nombre_usuario,
          rol: resData.rol || 'usuario',
          grupos: resData.grupos ?? [],
          persona: {
            nombre: personaRaw.nombre ?? '',
            apellidos: personaRaw.apellidos ?? '',
            foto_ruta: personaRaw.foto_ruta ?? '',
            puesto: puestoExtraido
          }
        };

        console.log("✅ Usuario formateado:", userData); // verifica que foto_ruta tenga valor

        // Evaluamos cómo el backend nos está enviando el dato:
        if (typeof personaRaw.puesto === 'string') {
          // Caso A: El backend ya hizo el mapeo directo
          puestoExtraido = personaRaw.puesto;
        } else if (typeof personaRaw.cargo === 'string') {
          // Caso B: El backend usó la variable cargo
          puestoExtraido = personaRaw.cargo;
        } else if (personaRaw.puestos && Array.isArray(personaRaw.puestos) && personaRaw.puestos.length > 0) {
          // Caso C (El de Prisma): Busca en el arreglo 'puestos' la relación activa
          const relacionActiva = personaRaw.puestos.find((rel: any) => rel.activo === true) || personaRaw.puestos[0];
          if (relacionActiva?.puesto?.nombre) {
            puestoExtraido = relacionActiva.puesto.nombre;
          }
        } else if (personaRaw.persona_puesto && Array.isArray(personaRaw.persona_puesto)) {
          // Caso D: Fallback por si la relación se llamó 'persona_puesto'
          const relacionActiva = personaRaw.persona_puesto.find((rel: any) => rel.activo === true);
          if (relacionActiva?.puesto?.nombre) {
            puestoExtraido = relacionActiva.puesto.nombre;
          }
        }

        // 4. Guardar y navegar
        localStorage.setItem('token', resData.token);
        localStorage.setItem('usuario', JSON.stringify(userData));

        console.log("✅ Usuario formateado:", userData);
        navigate('/welcome');
        return;

      } catch (backendError: any) {
        console.warn("⚠️ Error backend:", backendError);
        // Si es error de red o 404, pasamos al fallback
        if (backendError.message !== 'Network Error' && backendError.response?.status !== 404) {
          setError(backendError.response?.data?.message || "Error de conexión");
          setLoading(false);
          return;
        }
      }

      // 5. Fallback: Usuarios quemados (si el backend falla)
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
        setError("Usuario o contraseña incorrectos");
      }

    } catch (err) {
      setError("Error inesperado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-blue-50">
      <div className="flex w-full h-full overflow-hidden">

        {/* Panel Izquierdo - Imagen reducida con borde azul */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-blue-900 p-10 relative">
          {/* Patrón de puntos (se mantiene de fondo) */}
          <div className="absolute inset-0 opacity-20 z-0 mix-blend-overlay"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Contenedor de la imagen que permite el borde */}
          <div className="w-full h-full flex items-center justify-center z-10">
            <img
              src={laboratorio}
              alt="Imagen de Laboratorio"
              className="w-full max-h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-12">

          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={logoCentro}
                alt="Logo CMEE"
                className="h-28 w-auto"
              />
            </div>

            <h1 className="text-3xl font-extrabold text-blue-900 mb-1 text-center">Iniciar Sesion</h1>
            <p className="text-gray-400 text-sm mb-8 text-center">Ingresa tus credenciales para continuar</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">

              {/* Campo Usuario */}
              <div>
                <label className="text-sm font-semibold text-blue-900 mb-1 block">
                  Usuario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-blue-50"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="text-sm font-semibold text-blue-900 mb-1 block">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-blue-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm tracking-widest uppercase mt-2 disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Acceder'}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}