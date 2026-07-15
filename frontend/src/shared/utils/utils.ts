import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Valida cédula ecuatoriana (10 dígitos, algoritmo Módulo 10) */
export function validarCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const d = cedula.split('').map(Number);
  if (d[2] > 5) return false;
  const p = parseInt(cedula.slice(0, 2), 10);
  if ((p < 1 || p > 24) && p !== 30) return false;
  const suma = d.slice(0, 9).reduce((a, v, i) => {
    const mul = i % 2 === 0 ? 2 : 1;
    const res = v * mul;
    return a + (res > 9 ? res - 9 : res);
  }, 0);
  return d[9] === (10 - (suma % 10)) % 10;
}
