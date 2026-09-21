import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileSignature, Loader2, Upload, X, XCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { FirmaPdfError } from '../../../shared/utils/FirmaPdfError';
import { generarUuidV4 } from '../../../shared/utils/uuid';
import type { PosicionFirma } from '../../../shared/components/organisms/SelectorPosicionFirma';

// Carga diferida: pdfjs-dist (~350KB + worker) solo se descarga cuando
// alguien realmente abre el paso de "elegir posición de firma".
const SelectorPosicionFirma = lazy(
  () => import('../../../shared/components/organisms/SelectorPosicionFirma'),
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** ID del Documento cuyo workflow se está firmando/rechazando. */
  documentoId: number | null;
  /**
   * Ruta relativa del PDF actual del documento (`documento.archivo_url`) —
   * ya incluye las firmas de fases anteriores, así que el firmante nunca
   * tiene que descargar y volver a subir manualmente.
   */
  archivoUrl: string | null;
  tituloAccion: string;
  onSuccess: () => void;
}

type Accion = 'FIRMAR' | 'APROBAR' | 'RECHAZAR';

/** "YYYY-MM-DD" de hoy, en hora local — valor por defecto del selector de fecha. */
function hoyLocal(): string {
  const hoy = new Date();
  const offsetMs = hoy.getTimezoneOffset() * 60000;
  return new Date(hoy.getTime() - offsetMs).toISOString().slice(0, 10);
}
type Paso = 'idle' | 'firmando' | 'subiendo';

const API_BASE = import.meta.env.VITE_API_URL;
const BACKEND_BASE = (import.meta as any).env.VITE_BACKEND_URL || '';

const PASO_LABEL: Record<Paso, string> = {
  idle: '',
  firmando: 'Firmando con su certificado…',
  subiendo: 'Subiendo documento firmado…',
};

export default function FirmarDocumentoModal({
  isOpen,
  onClose,
  documentoId,
  archivoUrl,
  tituloAccion,
  onSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accion, setAccion] = useState<Accion | null>(null);
  const [pdfDescargado, setPdfDescargado] = useState<Uint8Array | null>(null);
  const [cargandoPdf, setCargandoPdf] = useState(false);
  const [posicionFirma, setPosicionFirma] = useState<PosicionFirma | null>(null);
  const [p12File, setP12File] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [tamanoSello, setTamanoSello] = useState<{ ancho: number; alto: number } | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [fechaRealizacion, setFechaRealizacion] = useState(hoyLocal());
  const [paso, setPaso] = useState<Paso>('idle');
  const [error, setError] = useState<string | null>(null);
  // Código público del documento — si ya existe (de una firma anterior de
  // otra fase), se reutiliza en vez de generar uno nuevo. Todas las fases
  // de un mismo documento deben compartir el mismo código: los sellos de
  // fases anteriores ya quedaron impresos en el PDF con su QR, y si el
  // código cambiara con cada firma esos QR más viejos dejarían de
  // encontrarse en la verificación aunque el documento siga siendo válido.
  const [codigoVerificacion, setCodigoVerificacion] = useState<string | null>(null);

  const enviando = paso !== 'idle';

  useEffect(() => {
    if (accion !== 'FIRMAR' || codigoVerificacion || !documentoId) return;
    let cancelado = false;
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE}/documentos/${documentoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelado) setCodigoVerificacion(data.codigo_verificacion ?? null);
        }
      } catch {
        // silencioso a propósito — si falla, handleFirmar genera uno nuevo
        // igual que antes; no debe bloquear la firma.
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [accion, documentoId, codigoVerificacion]);

  // Recalcula el tamaño real del recuadro de vista previa: usa el nombre del
  // certificado si ya se pudo leer (archivo + contraseña correctos) o el
  // texto de respaldo que usará la firma real si todavía no, para que el
  // recuadro sea preciso desde antes de terminar de escribir la contraseña.
  useEffect(() => {
    if (accion !== 'FIRMAR') return;
    let cancelado = false;
    (async () => {
      let nombre: string | null = null;
      if (p12File && password.length > 0) {
        try {
          const { extraerTitularCertificado } = await import(
            '../../../shared/utils/firmarPdf'
          );
          const buffer = Buffer.from(new Uint8Array(await p12File.arrayBuffer()));
          nombre = extraerTitularCertificado(buffer, password);
        } catch {
          nombre = null;
        }
      }
      if (cancelado) return;
      try {
        const { construirAparienciaSello } = await import(
          '../../../shared/utils/firma-pdf/crearAparienciaSello'
        );
        // El código real se genera recién al firmar (handleFirmar), pero su
        // longitud (UUID) es fija — un placeholder del mismo largo basta para
        // que el bloque QR estimado aquí salga del mismo tamaño que el real.
        const qrUrlEstimado = `${window.location.origin}/verificar-documento/00000000-0000-0000-0000-000000000000`;
        const { ancho, alto } = construirAparienciaSello({
          etiqueta: 'Firmado electrónicamente por:',
          nombre: nombre ?? 'Titular del certificado',
          qrUrl: qrUrlEstimado,
        });
        if (!cancelado) setTamanoSello({ ancho, alto });
      } catch {
        if (!cancelado) setTamanoSello(null);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [accion, p12File, password]);

  // Al elegir "Firmar documento" se descarga el PDF actual una sola vez,
  // para poder mostrarlo y que el usuario elija dónde va el sello.
  useEffect(() => {
    if (accion !== 'FIRMAR' || pdfDescargado || !archivoUrl) return;
    let cancelado = false;
    setCargandoPdf(true);
    setError(null);
    (async () => {
      try {
        const rutaLimpia = archivoUrl.replace(/\\/g, '/');
        const res = await fetch(`${BACKEND_BASE}/${rutaLimpia}`);
        if (!res.ok) throw new Error('No se pudo descargar el documento a firmar.');
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (!cancelado) setPdfDescargado(bytes);
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo descargar el documento.');
        }
      } finally {
        if (!cancelado) setCargandoPdf(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [accion, archivoUrl, pdfDescargado]);

  const resetYcerrar = () => {
    setAccion(null);
    setPdfDescargado(null);
    setCargandoPdf(false);
    setPosicionFirma(null);
    setP12File(null);
    setPassword('');
    setTamanoSello(null);
    setObservaciones('');
    setFechaRealizacion(hoyLocal());
    setPaso('idle');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleAprobar = async () => {
    if (!documentoId) return;
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_BASE}/documentos/${documentoId}/workflow/aprobar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comentario: observaciones.trim(),
          fecha_realizacion: fechaRealizacion,
        }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Error HTTP ${res.status}`);
    }
  };

  const handleRechazar = async () => {
    if (!documentoId) return;
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_BASE}/documentos/${documentoId}/workflow/rechazar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comentario: observaciones.trim() }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Error HTTP ${res.status}`);
    }
  };

  const handleFirmar = async () => {
    if (!documentoId || !pdfDescargado || !p12File || !posicionFirma) return;
    const token = localStorage.getItem('token');

    setPaso('firmando');
    // Carga diferida: las librerías de firma (~350KB) solo se descargan
    // cuando alguien realmente va a firmar, no en el bundle principal.
    const { firmarPdfConP12 } = await import('../../../shared/utils/firmarPdf');
    // Reutiliza el código de una fase anterior si ya existe (ver el efecto
    // que lo carga arriba); solo genera uno nuevo si el documento todavía
    // no tiene ninguno (primera firma del workflow).
    const codigo = codigoVerificacion ?? generarUuidV4();
    const qrUrl = `${window.location.origin}/verificar-documento/${codigo}`;
    const pdfFirmado = await firmarPdfConP12(
      pdfDescargado,
      p12File,
      password,
      tituloAccion,
      { posicion: posicionFirma, qrUrl },
    );

    setPaso('subiendo');
    const formData = new FormData();
    formData.append(
      'archivo',
      new Blob([pdfFirmado], { type: 'application/pdf' }),
      'documento_firmado.pdf',
    );
    formData.append('codigo_verificacion', codigo);
    formData.append('comentario', observaciones.trim());
    formData.append('fecha_realizacion', fechaRealizacion);
    const resSubida = await fetch(
      `${API_BASE}/documentos/${documentoId}/workflow/firmar`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );
    if (!resSubida.ok) {
      const err = await resSubida.json().catch(() => null);
      throw new Error(err?.message || `Error HTTP ${resSubida.status}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (accion === 'RECHAZAR') {
        setPaso('subiendo');
        await handleRechazar();
      } else if (accion === 'APROBAR') {
        setPaso('subiendo');
        await handleAprobar();
      } else if (accion === 'FIRMAR') {
        await handleFirmar();
      } else {
        return;
      }
      onSuccess();
      resetYcerrar();
    } catch (err) {
      setPaso('idle');
      setError(
        err instanceof FirmaPdfError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado.',
      );
    }
  };

  if (!isOpen || !documentoId) return null;

  const puedeFirmar =
    accion === 'FIRMAR' && p12File && password.length > 0 && !!posicionFirma && !!fechaRealizacion;
  const puedeAprobar = accion === 'APROBAR' && !!fechaRealizacion;
  const puedeRechazar = accion === 'RECHAZAR' && observaciones.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <div
        className={cn(
          'bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full relative flex flex-col max-h-[90vh]',
          accion === 'FIRMAR' && pdfDescargado ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">{tituloAccion}</h2>
          <button
            type="button"
            onClick={resetYcerrar}
            disabled={enviando}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              {accion === 'APROBAR'
                ? 'Aprueba esta fase sin firma digital — solo queda constancia de quién aprobó, cuándo y con qué comentario.'
                : accion === 'RECHAZAR'
                  ? 'El documento vuelve a la fase anterior para corregirse.'
                  : 'Firme con su certificado personal (.p12). El archivo y la contraseña no se envían al servidor — la firma se calcula en este navegador, sobre el PDF ya firmado por los pasos anteriores.'}
            </p>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Decisión
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAccion('FIRMAR')}
                  disabled={enviando}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'FIRMAR'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50',
                  )}
                >
                  <FileSignature className="h-5 w-5" />
                  Firmar documento
                </button>
                <button
                  type="button"
                  onClick={() => setAccion('APROBAR')}
                  disabled={enviando}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'APROBAR'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'border-border text-muted-foreground hover:border-blue-300 hover:bg-blue-50/50',
                  )}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setAccion('RECHAZAR')}
                  disabled={enviando}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'RECHAZAR'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:border-red-300 hover:bg-red-50/50',
                  )}
                >
                  <XCircle className="h-5 w-5" />
                  Rechazar
                </button>
              </div>
              {accion === 'APROBAR' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Avanza la fase sin firma digital (sin .p12) — deja constancia de quién
                  aprobó, cuándo y con qué comentario, pero no estampa ninguna firma en el PDF.
                </p>
              )}
            </div>

            {accion === 'FIRMAR' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="p12-file-doc"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Certificado (.p12) <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={enviando}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        Seleccionar archivo
                      </button>
                      <span className="truncate text-sm text-muted-foreground">
                        {p12File?.name ?? 'Ningún archivo seleccionado'}
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="p12-file-doc"
                      type="file"
                      accept=".p12,.pfx"
                      className="hidden"
                      onChange={(e) => setP12File(e.target.files?.[0] ?? null)}
                      disabled={enviando}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="p12-password-doc"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Contraseña del certificado{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="p12-password-doc"
                        type={verPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={enviando}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setVerPassword((v) => !v)}
                        title={
                          verPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                        disabled={enviando}
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {verPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="fecha-firma-doc"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Fecha en que se realizó <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="fecha-firma-doc"
                      type="date"
                      value={fechaRealizacion}
                      max={hoyLocal()}
                      onChange={(e) => setFechaRealizacion(e.target.value)}
                      disabled={enviando}
                      className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="comentario-firma-doc"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Comentario <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <textarea
                      id="comentario-firma-doc"
                      rows={3}
                      placeholder="Escriba un comentario sobre la firma..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      disabled={enviando}
                      className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {cargandoPdf ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Descargando documento…
                  </div>
                ) : pdfDescargado ? (
                  <div className="border-t border-border pt-4">
                    <Suspense
                      fallback={
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando visor de PDF…
                        </div>
                      }
                    >
                      <SelectorPosicionFirma
                        pdfBytes={pdfDescargado}
                        posicionActual={posicionFirma}
                        onSeleccionar={setPosicionFirma}
                        tamanoSello={tamanoSello}
                      />
                    </Suspense>
                  </div>
                ) : null}
              </div>
            )}

            {accion === 'APROBAR' && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="fecha-aprobacion-doc"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Fecha en que se realizó <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="fecha-aprobacion-doc"
                    type="date"
                    value={fechaRealizacion}
                    max={hoyLocal()}
                    onChange={(e) => setFechaRealizacion(e.target.value)}
                    disabled={enviando}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="comentario-aprobacion-doc"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Comentario <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <textarea
                    id="comentario-aprobacion-doc"
                    rows={3}
                    placeholder="Escriba un comentario sobre la aprobación..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={enviando}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {accion === 'RECHAZAR' && (
              <div>
                <label
                  htmlFor="observaciones-rechazo-doc"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Observaciones <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="observaciones-rechazo-doc"
                  rows={4}
                  placeholder="Indique el motivo del rechazo..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={enviando}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none disabled:opacity-50"
                />
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border shrink-0">
            <button
              type="button"
              onClick={resetYcerrar}
              disabled={enviando}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !(puedeFirmar || puedeAprobar || puedeRechazar)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50',
                accion === 'FIRMAR'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : accion === 'APROBAR'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : accion === 'RECHAZAR'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary',
              )}
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {PASO_LABEL[paso]}
                </>
              ) : accion === 'FIRMAR' ? (
                <>
                  <FileSignature className="h-4 w-4" />
                  Firmar
                </>
              ) : accion === 'APROBAR' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </>
              ) : accion === 'RECHAZAR' ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
