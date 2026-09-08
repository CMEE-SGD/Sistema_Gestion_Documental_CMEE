// src/interfaces/auth.interface.ts

export interface UserInfo {
  id: number;
  persona_id?: number;
  nombre_usuario: string;
  rol?: string;
  grupos?: { id: number; nombre: string }[];
  laboratorio_id?: number | null;
  persona?: {
    nombre: string;
    apellidos: string;
    avatar?: string;
    cargo?: string;
    puesto?: string;
    foto_ruta?: string;
  };
}