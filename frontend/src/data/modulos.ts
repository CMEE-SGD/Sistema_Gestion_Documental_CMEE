export interface Module {
  id: number;
  name: string;
  category: string;
  path: string;
}

export const modules: Module[] = [
  { id: 1, name: "Dashboard", category: "General", path: "/dashboard" },
  { id: 2, name: "Gestion de Usuarios", category: "Administracion", path: "/usuarios" },
  { id: 3, name: "Roles y Permisos", category: "Administracion", path: "/roles" },
  { id: 4, name: 'Gestor Documental', category: "Administracion", path: '/gestordocumental'},
  { id: 5, name: "Facturacion", category: "Finanzas", path: "/facturacion" },
  { id: 6, name: "Inventario", category: "Almacen", path: "/inventario" },
  { id: 7, name: "Proveedores", category: "Compras", path: "/proveedores" },
  { id: 8, name: "Clientes", category: "Ventas", path: "/clientes" },
  { id: 9, name: "Ordenes de Compra", category: "Compras", path: "/ordenes-compra" },
  { id: 10, name: "Ordenes de Venta", category: "Ventas", path: "/ordenes-venta" },
  { id: 11, name: "Recursos Humanos", category: "RRHH", path: "/rrhh" },
  { id: 12, name: "Nomina", category: "RRHH", path: "/nomina" },
  { id: 13, name: "Contabilidad", category: "Finanzas", path: "/contabilidad" },
  { id: 14, name: "Activos Fijos", category: "Finanzas", path: "/activos" },
  { id: 15, name: "Proyectos", category: "Operaciones", path: "/proyectos" },
  { id: 16, name: "Soporte Tecnico", category: "IT", path: "/soporte" },
  { id: 17, name: "Configuracion", category: "General", path: "/configuracion" },
  { id: 18, name: "Auditoria Global", category: "Administracion", path: "/auditoria" }, // <- Ajustado
  { id: 19, name: "Notificaciones", category: "General", path: "/notificaciones" },
  { id: 20, name: "Integraciones", category: "IT", path: "/integraciones" },
  { id: 21, name: "Laboratorios", category: "Operaciones", path: "/laboratorios" }, // <- Nuevo
];