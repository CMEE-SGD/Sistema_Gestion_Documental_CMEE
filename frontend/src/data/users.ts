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
