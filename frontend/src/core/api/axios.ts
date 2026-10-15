import axios from "axios"

// Opción extra por petición: `api.delete(url, { motivo })` /
// `api.patch(url, datos, { motivo })`. Se envía en la cabecera X-Motivo y el
// servidor la guarda en la bitácora de auditoría (ver leerMotivo() en
// auditoria.interceptor.ts). Va en cabecera y no en el cuerpo porque los DTOs
// del backend rechazan campos que no declaran.
declare module "axios" {
  // El parámetro genérico debe coincidir con el de la declaración original
  // de axios para que TypeScript fusione las interfaces.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  interface AxiosRequestConfig<D = any> {
    motivo?: string
  }
}

const api = axios.create({
baseURL: (import.meta as any).env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }
  if (config.motivo && config.motivo.trim()) {
    // Las cabeceras HTTP no admiten tildes ni ñ: se codifica y el servidor
    // la decodifica.
    config.headers["X-Motivo"] = encodeURIComponent(config.motivo.trim())
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/"
    }

    else if (error.response?.status === 403) {
      window.location.href = "/403"
    }
    return Promise.reject(error)
  }
)

export default api