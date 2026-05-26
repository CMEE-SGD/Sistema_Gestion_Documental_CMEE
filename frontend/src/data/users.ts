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
  fecha_nacimiento: string; 
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

  // --- Campos calculados o relacionados (JOINs) ---
  usuario?: string;
  esUsuarioExterno?: boolean;
  
  // Agregamos las relaciones que vienen de la base de datos
  roles?: { 
    id: number; 
    nombre: string; 
  }[];
  
  puestos?: {
    id?: number;
    departamento_id?: number | string;
    puesto_id?: number | string;
    departamento?: { id: number; nombre: string };
    puesto?: { id: number; nombre: string };
  }[];
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
