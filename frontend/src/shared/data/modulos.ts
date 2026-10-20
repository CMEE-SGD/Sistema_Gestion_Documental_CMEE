export interface Module {
  id: number;
  name: string;
  category: string;
  path: string;
}

// Debe reflejar exactamente las rutas reales de AppRouter.tsx — si se agrega
// o quita una pantalla ahí, actualizar esta lista también.
export const modules: Module[] = [
  { id: 1, name: "Gestion de Usuarios", category: "Administracion", path: "/usuarios" },
  { id: 2, name: "Grupos y Permisos", category: "Administracion", path: "/usuarios/grupos" },
  { id: 3, name: "Configuracion General", category: "Administracion", path: "/usuarios/configuracion" },
  { id: 4, name: "Auditoria Global", category: "Administracion", path: "/auditoria" },

  { id: 5, name: "Recursos Humanos", category: "RRHH", path: "/rrhh" },
  { id: 6, name: "Grupos de Organizacion", category: "RRHH", path: "/rrhh/grupos" },
  { id: 7, name: "Puestos", category: "RRHH", path: "/rrhh/puestos" },
  { id: 8, name: "Roles", category: "RRHH", path: "/rrhh/roles" },
  { id: 9, name: "Personas", category: "RRHH", path: "/rrhh/personas" },

  { id: 10, name: "Laboratorios", category: "Laboratorios", path: "/laboratorios" },
  { id: 11, name: "Equipos", category: "Laboratorios", path: "/laboratorios/equipos" },
  { id: 12, name: "Servicios", category: "Laboratorios", path: "/laboratorios/servicios" },

  { id: 13, name: "Gestor Documental", category: "Gestor Documental", path: "/gestordocumental" },
  { id: 14, name: "Configuracion de Gestor Documental", category: "Gestor Documental", path: "/gestordocumental/configuracion" },

  { id: 15, name: "Bandeja de Trabajo", category: "Recepcion de Equipos", path: "/administrativo/recepciones" },
  { id: 16, name: "Ordenes de Trabajo", category: "Recepcion de Equipos", path: "/administrativo/ordenes" },
  { id: 17, name: "Clientes Institucionales", category: "Recepcion de Equipos", path: "/administrativo/clientes" },
  { id: 18, name: "Certificados", category: "Recepcion de Equipos", path: "/administrativo/certificados" },
  { id: 19, name: "Reportes", category: "Recepcion de Equipos", path: "/administrativo/reportes" },
  { id: 27, name: "Proximas Calibraciones", category: "Recepcion de Equipos", path: "/administrativo/proximas-calibraciones" },

  { id: 23, name: "Proformas", category: "Gestion Financiera", path: "/financiero/proformas" },
  { id: 24, name: "Facturacion", category: "Gestion Financiera", path: "/financiero/facturas" },
  { id: 25, name: "Cartera", category: "Gestion Financiera", path: "/financiero/cartera" },
  { id: 26, name: "Proximas Calibraciones", category: "Gestion Financiera", path: "/financiero/proximas-calibraciones" },

  { id: 20, name: "Gestion de Calidad", category: "Calidad", path: "/calidad/auditorias" },

  { id: 21, name: "Inicio", category: "General", path: "/welcome" },
  { id: 22, name: "Preferencias", category: "General", path: "/preferencias" },
];
