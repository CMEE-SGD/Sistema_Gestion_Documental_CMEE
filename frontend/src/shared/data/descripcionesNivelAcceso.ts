// Qué desbloquea cada nivel de acceso (1-5) en cada aplicación del catálogo
// de Grupos, en frases cortas — mismo estilo que ya usa el selector de
// permisos por carpeta en Gestor Documental ("Nivel 2: Ver y Descargar").
// No es una regla de negocio, es solo texto informativo para la pantalla de
// Editar Grupo; hay que actualizarlo a mano si cambian los @RequireAccess
// de los controladores del backend.
//
// Los niveles de acceso son acumulativos (@RequireAccess exige nivel >= N),
// así que un nivel sin ningún endpoint propio (ej. nivel 3 en la mayoría de
// apps) da exactamente el mismo acceso que el nivel definido inmediato
// anterior — por eso repite el mismo texto en vez de decir "sin permisos".
// "Sin acceso" solo aparece cuando ese nivel de verdad queda por debajo del
// mínimo que la aplicación exige para cualquier cosa.
export const DESCRIPCION_NIVELES: Record<string, Partial<Record<number, string>>> = {
  'Gestion de Usuarios': {
    1: 'Ver usuarios',
    2: 'Ver apps y grupos',
    3: 'Ver apps y grupos',
    4: 'Editar grupos',
    5: 'Control total',
  },
  'Recursos Humanos': {
    1: 'Ver listados',
    2: 'Ver detalle de personas',
    3: 'Ver detalle de personas',
    4: 'Editar personas',
    5: 'Control total',
  },
  'Gestor Documental': {
    1: 'Sin acceso',
    2: 'Ver documentos',
    3: 'Ver documentos',
    4: 'Editar y firmar',
    5: 'Control total',
  },
  Laboratorios: {
    1: 'Sin acceso',
    2: 'Ver',
    3: 'Ver',
    4: 'Editar y vincular',
    5: 'Control total',
  },
  'Auditoria Global': {
    1: 'Sin acceso',
    2: 'Ver auditoría',
    3: 'Ver auditoría',
    4: 'Ver auditoría',
    5: 'Ver auditoría',
  },
  'Recepcion Equipos': {
    1: 'Ver',
    2: 'Descargar certificados',
    3: 'Crear órdenes',
    4: 'Editar y firmar',
    5: 'Eliminar',
  },
  'Gestion de Calidad': {
    1: 'Sin acceso',
    2: 'Ver',
    3: 'Ver',
    4: 'Editar',
    5: 'Control total',
  },
  Resumen: {
    1: 'Ver dashboards',
    2: 'Ver dashboards',
    3: 'Ver dashboards',
    4: 'Ver dashboards',
    5: 'Ver dashboards',
  },
};

/** Texto corto a mostrar para un nivel de una aplicación. */
export function descripcionNivel(nombreAplicacion: string, nivel: number): string {
  return DESCRIPCION_NIVELES[nombreAplicacion]?.[nivel] ?? '';
}
