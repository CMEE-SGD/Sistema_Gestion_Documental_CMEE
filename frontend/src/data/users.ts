export const users = [
  { id: 1, username: "user1", password: "pass123" },
  { id: 2, username: "user2", password: "pass456" },
];

export interface UserInfo {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  cargo: string;
  organizacion: string;
  telefono: string;
  rol: 'admin' | 'usuario' | 'supervisor';
  avatar?: string;
}

export interface Persona {
  id: number;
  codigo: string;
  saludo: string;
  nombre: string;
  apellidos: string;
  cedula_identidad: string;
  fecha_nacimiento: string; // Generalmente llega como string ISO 8601 desde el backend
  sexo: string;
  domicilio: string;
  ciudad: string;
  codigo_postal: string;
  provincia: string;
  telefono: string;
  fax: string;
  celular: string;
  email_1: string;
  email_2: string;
  foto_ruta: string;
  hoja_vida_ruta: string;
  tipo_recurso: string;
  fecha_alta: string;
  idioma: string;
  activo: boolean;
  created_at: string;
  updated_at: string;

  // --- Campos calculados o relacionados ---
  // Es muy probable que tu backend devuelva estos campos adicionales
  // haciendo JOIN con otras tablas para pintar la vista principal.
  puestos?: string[];
  usuario?: string;
  esUsuarioExterno?: boolean;
}

export const currentUser: UserInfo = {
  id: 1,
  nombre: 'José Tomás',
  apellido: 'Cusín Antamba',
  email: 'jt.cusin@cmee.mil.ec',
  cargo: 'Técnico de Metrología',
  organizacion: 'Centro de Metrología del Ejército Ecuatoriano',
  telefono: '+593 99 123 4567',
  rol: 'admin',
  avatar: undefined, // coloca la ruta de imagen si tienes: '../assets/avatar.png'
};
