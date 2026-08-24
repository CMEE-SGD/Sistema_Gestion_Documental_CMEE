// src/data/users.ts
import { UserInfo } from '../../modules/auth/interface/auth.interface';

// Lista de usuarios falsos para login (si los usas)
export const users = [
  { id: 1, username: "user1", password: "pass123" },
  { id: 2, username: "user2", password: "pass456" },
];

// Usuario actual (Mockeado) adaptado a la nueva interfaz
export const currentUser: UserInfo = {
  id: 1,
  nombre_usuario: 'jtcusin', // Nuevo campo requerido por la interfaz
  persona: {
    nombre: 'José Tomás',
    apellidos: 'Cusín Antamba',
    cargo: 'Técnico de Metrología',
    puesto: 'Técnico de Metrología',
    avatar: undefined, 
  }
};