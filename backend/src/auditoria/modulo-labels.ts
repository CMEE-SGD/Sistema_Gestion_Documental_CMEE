/** Traduce el segmento de URL (ej. "recepcion-equipos") a un nombre legible para la bitácora. */
export const MODULO_LABELS: Record<string, string> = {
  ACCESOS: 'Accesos',
  'RECEPCION-EQUIPOS': 'Recepción de Equipos',
  CERTIFICADOS: 'Certificados',
  'CLIENTES-INSTITUCIONALES': 'Clientes Institucionales',
  PERSONAS: 'Personas',
  USUARIOS: 'Usuarios',
  ROLES: 'Roles',
  PUESTOS: 'Puestos',
  GRUPOS: 'Grupos',
  LABORATORIOS: 'Laboratorios',
  EQUIPOS: 'Equipos',
  SERVICIOS: 'Servicios',
  DOCUMENTOS: 'Documentos',
  CARPETAS: 'Carpetas',
  CIRCUITOS: 'Circuitos',
  DEPARTAMENTOS: 'Departamentos',
  APLICACIONES: 'Aplicaciones',
  REPORTES: 'Reportes',
  AUDITORIA: 'Auditoría',
  NOTIFICACIONES: 'Notificaciones',
  'PERSONA-PUESTO': 'Asignación de Puestos',
  'CONFIGURACION-GENERAL': 'Configuración General',
};

export function etiquetaModulo(modulo: string): string {
  return MODULO_LABELS[modulo] ?? modulo;
}
