// Qué desbloquea cada nivel de acceso (1-5) en cada aplicación del catálogo
// de Grupos. No es una regla de negocio — es solo texto informativo para la
// pantalla de Editar Grupo, así que se mantiene a mano y hay que
// actualizarlo si cambian los @RequireAccess de los controladores del
// backend. Los niveles que ningún endpoint usa hoy para esa aplicación se
// marcan explícitamente en vez de inventarles una función.
export const DESCRIPCION_NIVELES: Record<string, Partial<Record<number, string>>> = {
  'Gestion de Usuarios': {
    1: 'Ver el listado de usuarios.',
    2: 'Ver el listado y detalle de aplicaciones y grupos de permisos.',
    4: 'Editar grupos de permisos (asignar niveles de acceso a cada aplicación).',
    5: 'Control total: crear, editar y eliminar usuarios, aplicaciones, grupos, sesiones activas y la configuración general del sistema.',
  },
  'Recursos Humanos': {
    1: 'Ver listados básicos (capacitaciones, departamentos, puestos, roles).',
    2: 'Ver el detalle de personas, roles, puestos y asignaciones persona-puesto.',
    4: 'Editar personas, y eliminar documentos o certificados de capacitación adjuntos a su ficha.',
    5: 'Control total: crear, editar y eliminar personas, departamentos, puestos, roles, capacitaciones y asignaciones.',
  },
  'Gestor Documental': {
    2: 'Ver documentos, versiones, carpetas, circuitos y el estado de los flujos de firma.',
    4: 'Editar documentos, carpetas y circuitos; firmar o rechazar documentos; restaurar versiones anteriores.',
    5: 'Control total: crear y eliminar documentos, versiones, carpetas y circuitos.',
  },
  Laboratorios: {
    2: 'Ver el listado y detalle de laboratorios, equipos, servicios y sub-áreas.',
    4: 'Editar laboratorios, equipos y servicios; vincular departamentos y crear/editar sub-áreas.',
    5: 'Control total: crear, eliminar y reactivar laboratorios, equipos y servicios.',
  },
  'Auditoria Global': {
    2: 'Ver los registros de auditoría (accesos, personas, documentos, roles, puestos). Este módulo no distingue niveles más altos: cualquier nivel 2 o superior da el mismo acceso.',
  },
  'Recepcion Equipos': {
    1: 'Ver el listado y detalle de órdenes, certificados, clientes institucionales y reportes.',
    2: 'Descargar certificados.',
    3: 'Crear nuevas órdenes de recepción, certificados y clientes institucionales.',
    4: 'Editar órdenes, asignar técnico, cambiar de estado y firmar certificados.',
    5: 'Eliminar órdenes, certificados o clientes institucionales; y generar la vista previa de a quién se notificaría.',
  },
  'Gestion de Calidad': {
    2: 'Ver auditorías internas, no conformidades, quejas y riesgos/oportunidades.',
    4: 'Editar auditorías, no conformidades (incluido su estado), quejas y riesgos.',
    5: 'Control total: crear y eliminar auditorías, no conformidades, quejas y riesgos.',
  },
  Resumen: {
    1: 'Ver los dashboards de estadísticas (clientes y laboratorios). Este módulo no distingue niveles más altos: cualquier nivel 1 o superior da el mismo acceso.',
  },
};

const SIN_USO = 'Ningún permiso del sistema exige hoy este nivel en esta aplicación — no desbloquea nada adicional.';

/** Texto a mostrar para un nivel de una aplicación, con un mensaje honesto cuando ese nivel no está en uso. */
export function descripcionNivel(nombreAplicacion: string, nivel: number): string {
  return DESCRIPCION_NIVELES[nombreAplicacion]?.[nivel] ?? SIN_USO;
}
