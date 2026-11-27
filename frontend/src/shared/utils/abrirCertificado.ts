import api from '../../core/api/axios';

// Abre el PDF de un certificado (o reporte) en una pestaña nueva CON SU NOMBRE
// ORIGINAL. Antes se descargaba con la sesión y se abría como copia temporal
// del navegador ("blob"), que no tiene nombre: al guardarla salía con un
// código. Ahora el backend da un enlace de 10 minutos al PDF real, que el
// navegador abre directo, y al descargarlo usa el nombre con que se subió.
//
// La pestaña se abre ANTES de pedir el enlace (en el mismo clic del usuario);
// si no, algunos navegadores (Edge) la bloquean como ventana emergente.
export async function abrirCertificado(
  certificadoId: number,
  tipo: 'reporte' | 'certificado' = 'certificado',
): Promise<void> {
  const ventana = window.open('', '_blank');
  try {
    // Cuerpo `{}` y no `null`: axios enviaría el texto "null", que el
    // servidor rechaza con 400 por no ser un JSON válido.
    const res = await api.post<{ url: string }>(
      `/certificados/${certificadoId}/enlace`,
      {},
      { params: { tipo } },
    );
    const destino = `${import.meta.env.VITE_API_URL}${res.data.url}`;
    if (ventana) ventana.location.href = destino;
    else window.open(destino, '_blank');
  } catch (err) {
    ventana?.close();
    throw err;
  }
}
