import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Plus, Trash2, Printer, Save } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import {
  generarNotaEntregaPdf,
  mostrarPdf,
  prepararVentanaPdf,
  type NotaEntregaPdfDatos,
} from '../../../shared/utils/notaEntregaPdf';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface NotaEntregaEquipoForm {
  equipo: string;
  marca: string;
  modelo: string;
  serie_codigo: string;
  accesorios: string;
  calibracion: '' | 'CALIBRADO' | 'SIN_CALIBRAR';
  certificado: '' | 'CON_CERTIFICADO' | 'SIN_CERTIFICADO';
  informe: string;
}

export interface NotaEntregaForm {
  numero: string;
  fecha_egreso: string;
  cliente: string;
  representante: string;
  direccion: string;
  telefono: string;
  observaciones: string;
  envio_empresa: string;
  envio_destinatario: string;
  envio_ciudad: string;
  envio_guia: string;
  envio_fecha: string;
  envio_factura_cmee: string;
  cliente_firma_nombre: string;
  cliente_firma_ci: string;
  cmee_firma_nombre: string;
  cmee_firma_ci: string;
  equipos: NotaEntregaEquipoForm[];
}

interface RespuestaNota {
  orden_trabajo_fisica: string;
  entregada: boolean;
  puede_editar: boolean;
  nota: (NotaEntregaForm & { id: number }) | null;
  sugerencia: NotaEntregaForm;
}

/** Consulta compartida con la ventana de entrega para saber si la nota ya existe. */
export const claveNotaEntrega = (ordenId: number | null) => ['nota-entrega', ordenId];

export function useNotaEntrega(ordenId: number | null, activo: boolean) {
  return useQuery<RespuestaNota>({
    queryKey: claveNotaEntrega(ordenId),
    queryFn: async () => (await api.get(`/recepcion-equipos/orden/${ordenId}/nota-entrega`)).data,
    enabled: !!ordenId && activo,
    staleTime: 0,
  });
}

const MAX_EQUIPOS = 30;

type ErrorApi = { response?: { data?: { message?: string | string[] } } };
const mensajeApi = (err: unknown): string | undefined => {
  const msg = (err as ErrorApi)?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : msg;
};

const filaVacia = (): NotaEntregaEquipoForm => ({
  equipo: '',
  marca: '',
  modelo: '',
  serie_codigo: '',
  accesorios: '',
  calibracion: '',
  certificado: '',
  informe: '',
});

const input =
  'block w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ordenId: number | null;
  ordenFisica?: string;
  /** Se llama cuando la nota quedó guardada. */
  onGuardada?: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function NotaEntregaModal({ isOpen, onClose, ordenId, ordenFisica, onGuardada }: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useNotaEntrega(ordenId, isOpen);

  const [form, setForm] = useState<NotaEntregaForm | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Al abrir (o llegar los datos) se carga lo guardado o, si no hay nota, la
  // sugerencia prellenada con los datos de la orden.
  useEffect(() => {
    if (!isOpen || !data) return;
    const base = data.nota ?? data.sugerencia;
    setForm({
      ...base,
      equipos: base.equipos.length ? base.equipos : [filaVacia()],
    });
    setErrores({});
  }, [isOpen, data]);

  if (!isOpen || !ordenId) return null;

  const soloLectura = !!data && !data.puede_editar;

  const set = <K extends keyof NotaEntregaForm>(campo: K, valor: NotaEntregaForm[K]) =>
    setForm((f) => (f ? { ...f, [campo]: valor } : f));

  const setEquipo = (i: number, campo: keyof NotaEntregaEquipoForm, valor: string) =>
    setForm((f) =>
      f ? { ...f, equipos: f.equipos.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)) } : f,
    );

  const validar = (): boolean => {
    if (!form) return false;
    const e: Record<string, string> = {};
    if (!form.numero.trim()) e.numero = 'Ingrese el número de la nota (viene preimpreso en la hoja).';
    else if (!/^[A-Za-z0-9-]+$/.test(form.numero.trim())) e.numero = 'Solo letras, dígitos y guiones.';
    if (!form.fecha_egreso) e.fecha_egreso = 'Ingrese la fecha de egreso.';
    if (!form.cliente.trim()) e.cliente = 'Ingrese el cliente.';
    if (!form.representante.trim()) e.representante = 'Ingrese el representante.';
    if (!form.direccion.trim()) e.direccion = 'Ingrese la dirección.';
    if (!form.telefono.trim()) e.telefono = 'Ingrese el teléfono.';
    if (form.equipos.length === 0) e.equipos = 'Agregue al menos un equipo.';
    else if (form.equipos.some((q) => !q.equipo.trim())) e.equipos = 'Cada fila debe indicar el equipo.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async (): Promise<boolean> => {
    if (!form || !validar()) return false;
    setGuardando(true);
    try {
      await api.put(`/recepcion-equipos/orden/${ordenId}/nota-entrega`, form);
      await queryClient.invalidateQueries({ queryKey: claveNotaEntrega(ordenId) });
      onGuardada?.();
      return true;
    } catch (err) {
      await alert({ message: mensajeApi(err) || 'No se pudo guardar la nota de entrega.' });
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const imprimir = async (datos: NotaEntregaForm, ventana: Window | null = null) => {
    try {
      const bytes = await generarNotaEntregaPdf(datos as NotaEntregaPdfDatos);
      mostrarPdf(bytes, `nota-de-entrega-${datos.numero}.pdf`, ventana);
    } catch (err) {
      ventana?.close();
      console.error('Error generando el PDF de la nota de entrega:', err);
      await alert({ message: 'No se pudo generar el PDF de la nota de entrega.' });
    }
  };

  const handleGuardar = async () => {
    if (await guardar()) {
      toast({ message: 'Nota de entrega guardada.' });
      onClose();
    }
  };

  const handleGuardarEImprimir = async () => {
    if (!form) return;
    // La pestaña se abre ahora, dentro del clic; el PDF se carga cuando esté listo.
    const ventana = prepararVentanaPdf();
    if (await guardar()) {
      toast({ message: 'Nota de entrega guardada.' });
      await imprimir(form, ventana);
    } else {
      ventana?.close();
    }
  };

  const etiqueta = 'mb-1 block text-xs font-medium text-muted-foreground';

  const campoTexto = (
    campo: keyof NotaEntregaForm,
    titulo: string,
    opts: { type?: string; requerido?: boolean; ayuda?: string } = {},
  ) => (
    <div>
      <label className={etiqueta}>
        {titulo} {opts.requerido && <span className="text-destructive">*</span>}
      </label>
      <input
        type={opts.type ?? 'text'}
        value={(form?.[campo] as string) ?? ''}
        onChange={(e) => set(campo, e.target.value as never)}
        disabled={soloLectura}
        className={input}
      />
      {opts.ayuda && !errores[campo] && <p className="mt-1 text-xs text-muted-foreground">{opts.ayuda}</p>}
      {errores[campo] && <p className="mt-1 text-xs text-destructive">{errores[campo]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 py-6 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-6xl rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              Nota de entrega
              {ordenFisica ? <span className="ml-1 text-muted-foreground">· orden #{ordenFisica}</span> : null}
            </h2>
            <p className="text-xs text-muted-foreground">
              Formato AC1.2.F2-1. Se llena aquí, se imprime y se firma en papel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading || (!form && !isError) ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : isError || !form ? (
          <div className="p-6 text-sm text-destructive">
            {mensajeApi(error) ?? 'No se pudo cargar la nota de entrega.'}
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {soloLectura && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {data?.entregada
                  ? 'La orden ya fue entregada: la nota no se puede modificar, pero sí imprimir.'
                  : 'Solo el receptor de la orden puede modificar la nota; puede consultarla e imprimirla.'}
              </div>
            )}

            {/* Número y datos del egreso */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {campoTexto('numero', 'N.º de nota', {
                requerido: true,
                ayuda: 'El que trae preimpreso la hoja de papel.',
              })}
              {campoTexto('fecha_egreso', 'Fecha de egreso', { type: 'date', requerido: true })}
              {campoTexto('envio_factura_cmee', 'Factura CMEE #')}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Registro de egreso</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {campoTexto('cliente', 'Cliente', { requerido: true })}
                {campoTexto('representante', 'Representante', { requerido: true })}
                {campoTexto('direccion', 'Dirección', { requerido: true })}
                {campoTexto('telefono', 'Teléfono', { requerido: true })}
              </div>
            </section>

            {/* Equipos y condición de salida */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Equipos y condición de salida</h3>
                {!soloLectura && (
                  <button
                    type="button"
                    disabled={form.equipos.length >= MAX_EQUIPOS}
                    onClick={() => set('equipos', [...form.equipos, filaVacia()])}
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar equipo
                  </button>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="w-8 px-2 py-2 text-left">#</th>
                      <th className="px-2 py-2 text-left">Equipo</th>
                      <th className="px-2 py-2 text-left">Marca</th>
                      <th className="px-2 py-2 text-left">Modelo</th>
                      <th className="px-2 py-2 text-left">Serie/Código</th>
                      <th className="px-2 py-2 text-left">Accesorios</th>
                      <th className="px-2 py-2 text-left">Calibración</th>
                      <th className="px-2 py-2 text-left">Certificado</th>
                      <th className="px-2 py-2 text-left">Informe</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.equipos.map((q, i) => (
                      <tr key={i} className="border-t border-border align-top">
                        <td className="px-2 py-2 text-xs text-muted-foreground">{i + 1}</td>
                        {(['equipo', 'marca', 'modelo', 'serie_codigo', 'accesorios'] as const).map((c) => (
                          <td key={c} className="px-1 py-1.5">
                            <input
                              value={q[c]}
                              onChange={(e) => setEquipo(i, c, e.target.value)}
                              disabled={soloLectura}
                              className={input}
                            />
                          </td>
                        ))}
                        <td className="px-1 py-1.5">
                          <select
                            value={q.calibracion}
                            onChange={(e) => setEquipo(i, 'calibracion', e.target.value)}
                            disabled={soloLectura}
                            className={input}
                          >
                            <option value="">—</option>
                            <option value="CALIBRADO">Calibrado</option>
                            <option value="SIN_CALIBRAR">Sin calibrar</option>
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <select
                            value={q.certificado}
                            onChange={(e) => setEquipo(i, 'certificado', e.target.value)}
                            disabled={soloLectura}
                            className={input}
                          >
                            <option value="">—</option>
                            <option value="CON_CERTIFICADO">Con certificado</option>
                            <option value="SIN_CERTIFICADO">Sin certificado</option>
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            value={q.informe}
                            onChange={(e) => setEquipo(i, 'informe', e.target.value)}
                            disabled={soloLectura}
                            className={input}
                          />
                        </td>
                        <td className="px-1 py-1.5 text-right">
                          {!soloLectura && form.equipos.length > 1 && (
                            <button
                              type="button"
                              title="Quitar equipo"
                              onClick={() => set('equipos', form.equipos.filter((_, j) => j !== i))}
                              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errores.equipos && <p className="mt-1 text-xs text-destructive">{errores.equipos}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                La hoja trae 10 filas; si hay más de 10 equipos se imprimen varias hojas con el mismo número.
              </p>
            </section>

            {/* Observaciones */}
            <section>
              <label className={etiqueta}>Observaciones</label>
              <textarea
                rows={3}
                value={form.observaciones}
                onChange={(e) => set('observaciones', e.target.value)}
                disabled={soloLectura}
                className={`${input} resize-none`}
              />
            </section>

            {/* Instrucciones de envío */}
            <section>
              <h3 className="mb-2 text-sm font-semibold">Instrucciones de envío</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campoTexto('envio_empresa', 'Empresa')}
                {campoTexto('envio_destinatario', 'Destinatario')}
                {campoTexto('envio_ciudad', 'Ciudad')}
                {campoTexto('envio_guia', 'Guía #')}
                {campoTexto('envio_fecha', 'Fecha de envío', { type: 'date' })}
              </div>
            </section>

            {/* Firmas (se firman en papel) */}
            <section>
              <h3 className="mb-2 text-sm font-semibold">Datos para las firmas</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {campoTexto('cliente_firma_nombre', 'Conforme cliente: nombre')}
                {campoTexto('cliente_firma_ci', 'Conforme cliente: C.I.')}
                {campoTexto('cmee_firma_nombre', 'Entrega conforme CMEE: nombre')}
                {campoTexto('cmee_firma_ci', 'Entrega conforme CMEE: C.I.')}
              </div>
            </section>
          </div>
        )}

        {/* Pie */}
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-b-xl border-t border-border bg-muted/30 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80"
          >
            {soloLectura ? 'Cerrar' : 'Cancelar'}
          </button>
          {form && soloLectura && (
            <button
              type="button"
              onClick={() => imprimir(form, prepararVentanaPdf())}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Printer className="h-4 w-4" /> Imprimir / PDF
            </button>
          )}
          {form && !soloLectura && (
            <>
              <button
                type="button"
                disabled={guardando}
                onClick={handleGuardar}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent disabled:opacity-50"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={handleGuardarEImprimir}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Guardar e imprimir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
