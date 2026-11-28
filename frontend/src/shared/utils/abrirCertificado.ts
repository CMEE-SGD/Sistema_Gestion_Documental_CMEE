import api from '../../core/api/axios';

// Abre el PDF de un certificado (o reporte) en una pestaña nueva CON SU NOMBRE
// ORIGINAL: el backend da un enlace de 10 minutos al PDF real, que el navegador
// abre directo, y al descargarlo usa el nombre con que se subió.
//
// Control de descargas: cada persona puede abrir un certificado UNA sola vez
// (abrirlo equivale a descargarlo); el Jefe del Departamento de Calidad, las
// veces que quiera. Antes de gastar esa única vez se pide confirmación.

type Confirmar = (opciones: { title?: string; message: string }) => Promise<boolean>;

/** Mensaje legible de un error de la API (o el texto por defecto). */
function mensajeDe(err: unknown, porDefecto: string): string {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(' ');
  return m || porDefecto;
}

/**
 * Devuelve false si el usuario canceló. Lanza Error con un mensaje para
 * mostrar si no se pudo abrir (por ejemplo, porque ya usó su única vez).
 */
export async function abrirCertificado(
  certificadoId: number,
  tipo: 'reporte' | 'certificado' = 'certificado',
  confirmar?: Confirmar,
): Promise<boolean> {
  const nombre = tipo === 'certificado' ? 'certificado' : 'reporte';
  // validateStatus: los rechazos (403, 409...) se muestran como aviso; sin
  // esto, el interceptor de axios llevaría a la página de "acceso denegado".
  const resEstado = await api
    .get<{ ilimitado: boolean; yaDescargado: boolean; message?: string }>(
      `/certificados/${certificadoId}/descarga-estado`,
      { params: { tipo }, validateStatus: () => true },
    )
    .catch((err) => {
      throw new Error(mensajeDe(err, `No se pudo abrir el ${nombre}.`));
    });
  if (resEstado.status >= 400) {
    throw new Error(mensajeDe({ response: resEstado }, `No se pudo abrir el ${nombre}.`));
  }
  const estado = resEstado.data;

  if (!estado.ilimitado) {
    if (estado.yaDescargado) {
      throw new Error(
        `Ya abrió este ${nombre} una vez. Solo el Jefe del Departamento de Calidad puede volver a descargarlo.`,
      );
    }
    const seguir = confirmar
      ? await confirmar({
          title: `Abrir ${nombre}`,
          message: `Solo puede abrir o descargar este ${nombre} UNA vez. Guárdelo en su equipo cuando se abra, porque después no podrá volver a abrirlo desde el sistema. ¿Abrirlo ahora?`,
        })
      : true;
    if (!seguir) return false;
  }

  // La pestaña se abre en el mismo clic del usuario (antes de pedir el
  // enlace); si no, algunos navegadores (Edge) la bloquean como emergente.
  const ventana = window.open('', '_blank');
  try {
    // Cuerpo `{}` y no `null`: axios enviaría el texto "null", que el
    // servidor rechaza con 400 por no ser un JSON válido.
    const res = await api.post<{ url: string }>(
      `/certificados/${certificadoId}/enlace`,
      {},
      { params: { tipo }, validateStatus: () => true },
    );
    if (res.status >= 400) {
      throw new Error(mensajeDe({ response: res }, `No se pudo abrir el ${nombre}.`));
    }
    const destino = `${import.meta.env.VITE_API_URL}${res.data.url}`;
    if (ventana) ventana.location.href = destino;
    else window.open(destino, '_blank');
    return true;
  } catch (err) {
    ventana?.close();
    // Un Error propio (rechazo del servidor) ya trae el mensaje a mostrar.
    if (err instanceof Error && !('response' in err)) throw err;
    throw new Error(mensajeDe(err, `No se pudo abrir el ${nombre}.`));
  }
}
