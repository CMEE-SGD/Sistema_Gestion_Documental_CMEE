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
    <div className="h-screen w-full bg-slate-100">
      <div className="flex h-full">

        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex w-[55%] relative overflow-hidden bg-slate-800">

          <img
            src={laboratorio}
            alt="Laboratorio"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-900/45" />

          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Sistema de Gestión Documental
            </h2>

            <p className="text-slate-200 text-lg max-w-lg">
              Centro de Metrología del Ejército Ecuatoriano
            </p>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center px-8">

          <div className="w-full max-w-md">

            {/* LOGO */}
            <div className="flex justify-center mb-6">
              <img
                src={logoCentro}
                alt="Logo CMEE"
                className="h-20 w-auto"
              />
            </div>

            {/* TITULO */}
            <div className="text-center mb-10">

              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Iniciar Sesión
              </h1>

              <p className="text-slate-500">
                Ingrese sus credenciales para continuar
              </p>

              <div className="w-20 h-1 bg-[#1e3a5f] rounded-full mx-auto mt-4" />

            </div>

            {/* FORMULARIO */}
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* USUARIO */}
              <div>

                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Usuario
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">

                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>

                  </span>

                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    bg-white
                    border
                    border-slate-300
                    rounded-xl
                    text-slate-700
                    placeholder:text-slate-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#1e3a5f]/20
                    focus:border-[#1e3a5f]
                    transition-all
                    "
                  />
                </div>

              </div>

              {/* CONTRASEÑA */}
              <div>

                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Contraseña
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">

                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>

                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                    w-full
                    pl-10
                    pr-12
                    py-3
                    bg-white
                    border
                    border-slate-300
                    rounded-xl
                    text-slate-700
                    placeholder:text-slate-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#1e3a5f]/20
                    focus:border-[#1e3a5f]
                    transition-all
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-700
                    "
                  >
                    👁
                  </button>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* BOTON */}
              <Button
                type="submit"
                disabled={loading}
                className="
                w-full
                h-12
                bg-[#1e3a5f]
                hover:bg-[#16324d]
                text-white
                rounded-xl
                font-medium
                disabled:opacity-50
                "
              >
                {loading ? "Validando..." : "Acceder"}
              </Button>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}