// PATCH: Componente read‑only que emula la cuadrícula densa del Excel legacy.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Printer } from 'lucide-react';
import ClienteDatosCard, {
  type ClienteDatos,
} from './ClienteDatosCard';
import VistaDetalleEquipo from './VistaDetalleEquipo';

// ---------------------------------------------------------------------------
// Tipos basados en el include del backend (recepcion-equipos.service.ts)
// ---------------------------------------------------------------------------

type ClienteResumen = ClienteDatos;

interface LaboratorioResumen {
  id: number;
  nombre: string;
  responsable_id: number | null;
}

interface TecnicoResumen {
  id: number;
  nombre: string;
  apellidos: string;
}

interface CertificadoResumen {
  id: number;
}

export interface EquipoResumen {
  id: number;
  equipo_descripcion: string;
  marca: string | null;
  modelo: string | null;
  codigo_serie: string | null;
  codigo_cmee: string | null;
  accesorios: string | null;
  requerimientos_calibracion: string | null;
  laboratorio_id: number;
  laboratorio: LaboratorioResumen | null;
  fecha_ingreso_laboratorio: string | null;
  fecha_calibracion?: string | null;
  fecha_proxima_calibracion?: string | null;
  estado: string;
  tecnico_id: number | null;
  tecnico: TecnicoResumen | null;
  certificados: CertificadoResumen[];
  historial_estado: {
    id: number;
    estado_anterior: string;
    estado_nuevo: string;
    accion: string;
    observaciones: string | null;
    createdAt: string;
    realizado_por_id: number;
  }[];
}

export interface OrdenTrabajoDetalle {
  id: number;
  orden_trabajo_fisica: string;
  n_proforma: string | null;
  proforma_id: number | null;
  fecha_ingreso: string;
  observaciones: string | null;
  recibe_responsable_id: number | null;
  cliente_id: number;
  cliente: ClienteResumen;
  equipos: EquipoResumen[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constantes de estado con color
// ---------------------------------------------------------------------------

export const ESTADO_COLOR: Record<string, string> = {
  EN_ESPERA: 'bg-amber-100 text-amber-800 border-amber-300',
  EN_CALIBRACION: 'bg-blue-100 text-blue-800 border-blue-300',
  REVISION_OBT: 'bg-violet-100 text-violet-800 border-violet-300',
  PENDIENTE_FIRMA_TECNICO: 'bg-orange-100 text-orange-800 border-orange-300',
  REVISION_JEFE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  REVISION_DIRECTOR: 'bg-purple-100 text-purple-800 border-purple-300',
  LISTO_PARA_ENTREGA: 'bg-teal-100 text-teal-800 border-teal-300',
  FINALIZADO: 'bg-green-100 text-green-800 border-green-300',
};

export const ESTADO_LABEL: Record<string, string> = {
  EN_ESPERA: 'En espera',
  EN_CALIBRACION: 'En calibración',
  REVISION_OBT: 'Revisión OBT',
  PENDIENTE_FIRMA_TECNICO: 'Pendiente firma técnico',
  REVISION_JEFE: 'Revisión jefe',
  REVISION_DIRECTOR: 'Revisión director',
  LISTO_PARA_ENTREGA: 'Listo para entrega',
  FINALIZADO: 'Finalizado',
};

// ---------------------------------------------------------------------------
// Formateo de fecha
// ---------------------------------------------------------------------------

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  orden: OrdenTrabajoDetalle;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VistaDetalleOrden({ orden, onClose }: Props) {
  const { cliente, equipos } = orden;

  // Clic sobre un equipo dentro de la tabla → detalle de su calibración.
  const [detalleEquipoId, setDetalleEquipoId] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-4">
      {/* PATCH: mismo ancho del modal de edición */}
      <div className="bg-white text-foreground border border-border rounded-xl shadow-lg w-[95vw] max-w-[1800px] relative mx-4 flex flex-col">
        {/* ============================================================== */}
        {/* HEADER DEL MODAL */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-muted/30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              Orden de Trabajo N° <span className="text-red-600">{orden.orden_trabajo_fisica}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONTENIDO */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* ---------------------------------------------------------- */}
          {/* CABECERA — Compact summary grid */}
          {/* ---------------------------------------------------------- */}
          {/* PATCH: fondo gris claro tipo "header info" de Excel */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Datos Generales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  N° Orden Física
                </span>
                <span className="text-base font-bold text-red-600">
                  {orden.orden_trabajo_fisica}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  N° Proforma
                </span>
                {orden.proforma_id ? (
                  <Link
                    to={`/administrativo/proformas?proforma=${orden.proforma_id}`}
                    title="Ver detalle de la proforma"
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    {orden.n_proforma || '—'}
                  </Link>
                ) : (
                  <span className="text-base font-semibold">
                    {orden.n_proforma || '—'}
                  </span>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Cliente / Unidad
                </span>
                <span className="text-base font-semibold">
                  {cliente?.nombre || '—'}
                </span>
                {cliente?.tipo && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({cliente.tipo})
                  </span>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Fecha de Ingreso
                </span>
                <span className="text-base font-semibold">
                  {formatDate(orden.fecha_ingreso)}
                </span>
              </div>
            </div>
            {orden.observaciones?.trim() && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Observaciones
                </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {orden.observaciones}
                </p>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* CLIENTE — todos los datos del cliente / unidad solicitante */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <ClienteDatosCard cliente={cliente} />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* DETALLE — Excel‑style dense grid */}
          {/* ---------------------------------------------------------- */}
          {/* PATCH: tabla con border-collapse, border-slate-300, padding ajustado */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Equipos Recibidos ({equipos.length})
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {/* PATCH: cabecera estilo Excel (fondo oscuro, texto blanco) */}
                  <tr className="bg-slate-700 text-white">
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Código CMEE</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Descripción</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Marca</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Modelo</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Serie</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Accesorios</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Req. Calibración</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Laboratorio</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">F. Ingreso Lab</th>
                    <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">Estado</th>
                    <th className="px-2 py-1.5 text-left font-semibold">Técnico</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((eq, i) => (
                    <tr
                      key={eq.id}
                      className="border-b border-slate-200 even:bg-slate-50 hover:bg-slate-100"
                    >
                      <td className="px-2 py-1 border-r border-slate-200 text-muted-foreground text-xs align-top">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 font-mono text-xs align-top">
                        {eq.codigo_cmee || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top font-medium">
                      <button
                        type="button"
                        onClick={() => setDetalleEquipoId(eq.id)}
                        title="Ver detalles de la calibración"
                        className="text-left font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                      >
                        {eq.equipo_descripcion}
                      </button>
                    </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        {eq.marca || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        {eq.modelo || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top font-mono text-xs">
                        {eq.codigo_serie || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        {eq.accesorios || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        {eq.requerimientos_calibracion || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        {eq.laboratorio?.nombre || '—'}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top text-xs whitespace-nowrap">
                        {formatDate(eq.fecha_ingreso_laboratorio)}
                      </td>
                      <td className="px-2 py-1 border-r border-slate-200 align-top">
                        <span
                          className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${
                            ESTADO_COLOR[eq.estado] || 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {ESTADO_LABEL[eq.estado] || eq.estado}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top text-xs">
                        {eq.tecnico
                          ? `${eq.tecnico.nombre} ${eq.tecnico.apellidos}`
                          : '—'}
                      </td>
                    </tr>
                  ))}

                  {equipos.length === 0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-2 py-4 text-center text-muted-foreground"
                      >
                        No hay equipos registrados en esta orden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {detalleEquipoId !== null && (
        <VistaDetalleEquipo
          orden={orden}
          equipoId={detalleEquipoId}
          onClose={() => setDetalleEquipoId(null)}
        />
      )}
    </div>
  );
}
