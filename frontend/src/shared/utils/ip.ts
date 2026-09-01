// frontend/src/shared/utils/ip.ts

/**
 * Obtiene la IP local (LAN) del equipo cliente. El servidor solo ve la IP
 * del proxy/VPS, por lo que la máquina real debe reportar su propia IP.
 *
 * Usa WebRTC (RTCPeerConnection) para descubrir las direcciones locales
 * candidatas; en navegadores modernos puede devolver null (protección mDNS).
 */
export const obtenerIpLocal = (): Promise<string | null> =>
  new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
        resolve(null);
        return;
      }
      const pc = new RTCPeerConnection({ iceServers: [] });
      const candidatos: string[] = [];
      pc.onicecandidate = (event) => {
        const texto = event?.candidate?.candidate;
        if (!texto) {
          pc.close();
          const ip = candidatos[0] || null;
          resolve(ip);
          return;
        }
        const match = texto.match(/(?:candidate:.*?\s)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\s|$)/);
        if (match && !candidatos.includes(match[1])) candidatos.push(match[1]);
      };
      pc.createDataChannel('obtener-ip');
      pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {
        pc.close();
        resolve(null);
      });
      // Timeout de seguridad por si nunca llega el candidato
      setTimeout(() => {
        pc.close();
        resolve(candidatos[0] || null);
      }, 2000);
    } catch {
      resolve(null);
    }
  });

/**
 * Intenta obtener la IP del equipo; ante cualquier fallo devuelve null.
 */
export const obtenerIpCliente = async (): Promise<string | null> => {
  try {
    return await obtenerIpLocal();
  } catch {
    return null;
  }
};