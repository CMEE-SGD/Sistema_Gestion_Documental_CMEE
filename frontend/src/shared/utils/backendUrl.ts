export const BACKEND_URL =
  (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Construye una URL absoluta hacia un archivo servido por el backend
 * (fotos, PDFs, etc.), sin importar si `ruta` ya trae o no la barra inicial.
 */
export function buildFileUrl(ruta?: string | null): string | null {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  const rutaNormalizada = ruta.replace(/\\/g, '/');
  const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const path = rutaNormalizada.startsWith('/') ? rutaNormalizada : `/${rutaNormalizada}`;
  return `${baseUrl}${path}`;
}
