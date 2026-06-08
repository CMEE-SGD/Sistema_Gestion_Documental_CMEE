// src/interfaces/persona.interface.ts
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

  usuario?: { nombre_usuario: string; estado_cuenta?: boolean; } | null;
  esUsuarioExterno?: boolean;
  roles?: { id: number; nombre: string; }[];
  puestos?: {
    id?: number;
    departamento_id?: number | string;
    puesto_id?: number | string;
    departamento?: { id: number; nombre: string };
    puesto?: { id: number; nombre: string };
  }[];
}