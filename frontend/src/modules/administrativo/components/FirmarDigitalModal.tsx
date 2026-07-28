import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileSignature, Loader2, Upload, X, XCircle } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { FirmaPdfError } from '../../../shared/utils/FirmaPdfError';
import type { PosicionFirma } from '../../../shared/components/organisms/SelectorPosicionFirma';

// Carga diferida: pdfjs-dist (~350KB + worker) solo se descarga cuando
// alguien realmente abre el paso de "elegir posición de firma".
const SelectorPosicionFirma = lazy(
  () => import('../../../shared/components/organisms/SelectorPosicionFirma'),
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** ID del EquipoRecepcion — se usa para el camino de rechazo (transición de estado normal). */
  recepcionId: number | null;
  /** ID del Certificado cuyo PDF hay que descargar, firmar y volver a subir. */
  certificadoId: number | null;
  tituloAccion: string;
  onSuccess: () => void;
}

type Accion = 'FIRMAR' | 'RECHAZAR';
type Paso = 'idle' | 'firmando' | 'subiendo';

const API_BASE = import.meta.env.VITE_API_URL;

const PASO_LABEL: Record<Paso, string> = {
  idle: '',
  firmando: 'Firmando con su certificado…',
  subiendo: 'Subiendo documento firmado…',
};

export default function FirmarDigitalModal({
  isOpen,
  onClose,
  recepcionId,
  certificadoId,
  tituloAccion,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accion, setAccion] = useState<Accion | null>(null);
  const [pdfDescargado, setPdfDescargado] = useState<Uint8Array | null>(null);
  const [cargandoPdf, setCargandoPdf] = useState(false);
  const [posicionFirma, setPosicionFirma] = useState<PosicionFirma | null>(null);
  const [p12File, setP12File] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [paso, setPaso] = useState<Paso>('idle');
  const [error, setError] = useState<string | null>(null);

  const enviando = paso !== 'idle';

  // Al elegir "Firmar digitalmente" se descarga el PDF actual una sola vez,
  // para poder mostrarlo y que el usuario elija dónde va el sello.
  useEffect(() => {
    if (accion !== 'FIRMAR' || pdfDescargado || !certificadoId) return;
    let cancelado = false;
    setCargandoPdf(true);
    setError(null);
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_BASE}/certificados/download/${certificadoId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
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
  }, [accion, certificadoId, pdfDescargado]);

  const resetYcerrar = () => {
    setAccion(null);
    setPdfDescargado(null);
    setCargandoPdf(false);
    setPosicionFirma(null);
    setP12File(null);
    setPassword('');
    setObservaciones('');
    setPaso('idle');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleRechazar = async () => {
    if (!recepcionId) return;
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_BASE}/recepcion-equipos/${recepcionId}/transicion-estado`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'RECHAZAR',
          observaciones: observaciones.trim(),
        }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Error HTTP ${res.status}`);
    }
  };

  const handleFirmar = async () => {
    if (!certificadoId || !pdfDescargado || !p12File || !posicionFirma) return;
    const token = localStorage.getItem('token');

    setPaso('firmando');
    // Carga diferida: las librerías de firma (~350KB) solo se descargan
    // cuando alguien realmente va a firmar, no en el bundle principal.
    const { firmarPdfConP12 } = await import('../../../shared/utils/firmarPdf');
    const pdfFirmado = await firmarPdfConP12(
      pdfDescargado,
      p12File,
      password,
      tituloAccion,
      { posicion: posicionFirma },
    );

    setPaso('subiendo');
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([pdfFirmado], { type: 'application/pdf' }),
      'certificado_firmado.pdf',
    );
    const resSubida = await fetch(
      `${API_BASE}/certificados/${certificadoId}/firmar`,
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
      } else if (accion === 'FIRMAR') {
        await handleFirmar();
      } else {
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
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

  if (!isOpen || !recepcionId) return null;

  const puedeFirmar =
    accion === 'FIRMAR' && p12File && password.length > 0 && !!posicionFirma;
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
              Firme con su certificado personal (.p12). El archivo y la
              contraseña no se envían al servidor — la firma se calcula en
              este navegador.
            </p>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Decisión
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccion('FIRMAR')}
                  disabled={enviando}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'FIRMAR'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50',
                  )}
                >
                  <FileSignature className="h-5 w-5" />
                  Firmar digitalmente
                </button>
                <button
                  type="button"
                  onClick={() => setAccion('RECHAZAR')}
                  disabled={enviando}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    accion === 'RECHAZAR'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:border-red-300 hover:bg-red-50/50',
                  )}
                >
                  <XCircle className="h-5 w-5" />
                  Rechazar
                </button>
              </div>
            </div>

            {accion === 'FIRMAR' && (
              <div className="space-y-4">
                {cargandoPdf ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Descargando documento…
                  </div>
                ) : pdfDescargado ? (
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
                    />
                  </Suspense>
                ) : null}

                {posicionFirma && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div>
                      <label
                        htmlFor="p12-file"
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
                        id="p12-file"
                        type="file"
                        accept=".p12,.pfx"
                        className="hidden"
                        onChange={(e) => setP12File(e.target.files?.[0] ?? null)}
                        disabled={enviando}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="p12-password"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Contraseña del certificado{' '}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="p12-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={enviando}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {accion === 'RECHAZAR' && (
              <div>
                <label
                  htmlFor="observaciones-rechazo"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Observaciones <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="observaciones-rechazo"
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
              disabled={enviando || !(puedeFirmar || puedeRechazar)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50',
                accion === 'FIRMAR'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
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
