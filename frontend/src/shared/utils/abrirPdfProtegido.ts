// Descarga un PDF protegido por JWT (requiere el header Authorization, así
// que no se puede simplemente navegar a la URL) y lo abre en una pestaña
// nueva.
//
// La pestaña se abre de forma síncrona, ANTES del fetch, y recién luego se
// le asigna el blob ya descargado. Si en cambio se llama a window.open()
// después de un await (como se hacía antes), el navegador ya no lo asocia
// con el click del usuario y algunos navegadores lo tratan como pop-up no
// solicitado. Chrome y Brave son permisivos con eso; Microsoft Edge no —
// bloquea la ventana en silencio pese a compartir el mismo motor Chromium,
// por sus propias políticas de pop-ups/SmartScreen encima del motor.
export async function abrirPdfProtegido(url: string): Promise<void> {
  const ventana = window.open('', '_blank');
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Error HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    if (ventana) {
      ventana.location.href = objectUrl;
    } else {
      // Pop-ups bloqueados por completo en el navegador: intento de
      // respaldo, igual que el comportamiento anterior.
      window.open(objectUrl, '_blank');
    }
  } catch (err) {
    ventana?.close();
    throw err;
  }
}
