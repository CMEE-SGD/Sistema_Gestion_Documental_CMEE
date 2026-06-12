// src/shared/utils/auth.ts

/**
 * Verifica si el usuario autenticado tiene el nivel de acceso requerido para un módulo específico.
 * @param modulo Nombre exacto de la aplicación (ej: 'Laboratorios', 'Recursos Humanos')
 * @param nivelRequerido Rango del 1 al 5
 */
export const tienePermiso = (modulo: string, nivelRequerido: number): boolean => {
    const usuarioRaw = localStorage.getItem('usuario');
    if (!usuarioRaw) return false;

    try {
        const usuario = JSON.parse(usuarioRaw);
        
        // Recorremos los grupos asignados al usuario buscando la aplicación y el nivel mínimo
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