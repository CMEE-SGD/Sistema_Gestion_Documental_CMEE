import { SetMetadata } from '@nestjs/common';

export const SIN_MOTIVO_KEY = 'auditoria:sin_motivo';

/**
 * Marca un endpoint PATCH/PUT/DELETE como EXENTO de la exigencia de motivo
 * (ver AuditoriaInterceptor). Por defecto TODA edición o eliminación debe traer
 * la cabecera X-Motivo; esta marca es solo para acciones que no son "editar o
 * eliminar un recurso":
 *   - marcar notificaciones como leídas,
 *   - preferencias del propio perfil,
 *   - transiciones de flujo que ya cargan sus propias observaciones
 *     (aprobar/rechazar, asignar técnico, cambiar fase, estado de calidad),
 *   - Configuración General (así un administrador siempre puede apagar la
 *     exigencia aunque algún flujo estuviera fallando).
 *
 * Un endpoint exento igual guarda el motivo si el cliente lo envía.
 */
export const SinMotivo = () => SetMetadata(SIN_MOTIVO_KEY, true);
