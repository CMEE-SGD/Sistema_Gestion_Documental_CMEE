// src/interfaces/auth.interface.ts

export interface UserInfo {
  id: number;
  nombre_usuario: string;
  persona?: {
    nombre: string;
    apellidos: string;
    avatar?: string;
    cargo?: string;
    puesto?: string;
  };
}