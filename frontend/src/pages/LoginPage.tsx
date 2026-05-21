import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { users } from "../data/users"; // Asegúrate de que este camino sea correcto
import { logoCentro } from "../assets"; // Asegúrate de que este camino sea correcto
import { laboratorio } from "../assets"; // Asegúrate de que este camino sea correcto

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      navigate('/welcome');
    } else {
      setError("Usuario o contraseña incorrectos");
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
        {/* Usamos items-center para centrar el contenedor interno */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-12">

          {/* Contenedor interno para hacer los inputs más pequeños (max-w-sm = 384px) */}
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

              {/* Botón */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 hover:shadow-blue-300 hover:scale-[1.01] active:scale-[0.99] text-sm tracking-widest uppercase mt-2"
              >
                Acceder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}