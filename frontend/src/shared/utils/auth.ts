export interface UsuarioStorage {
  id: number;
  nombre_usuario: string;
  rol?: string;
  persona?: {
    nombre?: string;
    apellidos?: string;
    puesto?: string;
  };
  grupos?: Array<{
    nombre?: string;
    aplicaciones?: Array<{
      aplicacion: { nombre: string };
      nivel: number;
    }>;
  }>;
}

function getUsuario(): UsuarioStorage | null {
  try {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Devuelve el puesto del usuario (full job-title string) desde localStorage.
 */
export function getPuesto(): string {
  return getUsuario()?.persona?.puesto ?? '';
}

/**
 * Devuelve el rol del usuario (admin/usuario) desde localStorage.
 */
export function getRol(): string {
  return getUsuario()?.rol ?? 'usuario';
}

/**
 * Verifica si el puesto del usuario corresponde a un rol restringido
 * que solo debe ver/operar sobre su propio laboratorio.
 */
export function esRolRestringido(): boolean {
  const puesto = getPuesto();
  return (
    puesto.includes('Observador Técnico') ||
    puesto.includes('RET') ||
    puesto.includes('PEC')
  );
}

/**
 * Verifica si el usuario autenticado tiene el nivel de acceso requerido para un módulo específico.
 * @param modulo Nombre exacto de la aplicación (ej: 'Laboratorios', 'Recursos Humanos')
 * @param nivelRequerido Rango del 1 al 5
 */
export const tienePermiso = (modulo: string, nivelRequerido: number): boolean => {
    const usuario = getUsuario();
    if (!usuario) return false;

    try {
        // El usuario "Dios" (backend: isGod) llega con un grupo en memoria
        // llamado GOD_MODE que no cubre todas las aplicaciones reales — se le
        // da acceso libre aquí igual que hace AccessGuard en el backend.
        const esGod = usuario.grupos?.some((grupo) => grupo.nombre === 'GOD_MODE');
        if (esGod) return true;

        return usuario.grupos?.some((grupo: any) =>
        grupo.aplicaciones?.some((appConfig: any) =>
            appConfig.aplicacion.nombre === modulo && appConfig.nivel >= nivelRequerido
        )
        ) ?? false;
    } catch (error) {
        console.error('Error al validar permisos de usuario:', error);
        return false;
    }
};