// Detalle read-only de un equipo y su calibración — se abre al hacer clic
// sobre el equipo en la Bandeja de Trabajo. Muestra los datos del equipo,
// los detalles de la calibración (requisitos, certificados, técnico,
// historial de fases) y los datos completos del cliente / unidad.
// Mismo estilo visual que el detalle de órdenes (VistaDetalleOrden).

import { useState } from 'react';
import { X, Printer, FlaskConical, Eye, CalendarClock, FileX } from 'lucide-react';
import api from '../../../core/api/axios';
import { abrirPdfProtegido } from '../../../shared/utils/abrirPdfProtegido';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { esUsuarioAdministrador } from '../../../shared/utils/auth';
import ClienteDatosCard from './ClienteDatosCard';
import {
  ESTADO_COLOR,
  ESTADO_LABEL,
  formatDate,
  type EquipoResumen,
  type OrdenTrabajoDetalle,
} from './VistaDetalleOrden';

interface Props {
  orden: OrdenTrabajoDetalle;
  equipoId: number;
  onClose: () => void;
}

// El detalle del backend incluye sub_area aunque el tipo base no lo declare.
type EquipoDetalle = EquipoResumen & {
  sub_area?: { id: number; nombre: string } | null;
};

const ACCION_LABEL: Record<string, { label: string; tone: string }> = {
  APROBAR: {
    label: 'Aprobación',
    tone: 'border-blue-300 bg-blue-100 text-blue-700',
  },
  RECHAZAR: {
    label: 'Rechazo',
    tone: 'border-red-300 bg-red-100 text-red-700',
  },
  AJUSTE_ADMIN: {
    label: 'Ajuste del administrador',
    tone: 'border-amber-300 bg-amber-100 text-amber-700',
  },
};

function NumeroItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-base font-semibold ${
          mono ? 'font-mono text-sm leading-6' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function VistaDetalleEquipo({
  orden,
  equipoId,
  onClose,
}: Props) {
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdministrador = esUsuarioAdministrador();

  const equipo =
    (orden.equipos.find((e) => e.id === equipoId) as EquipoDetalle | undefined) ??
    null;

  if (!equipo) return null;

  const historial = equipo.historial_estado ?? [];
  const [certificados, setCertificados] = useState(equipo.certificados ?? []);

  const handleVerDocumento = async (certificadoId: number) => {
    try {
      await abrirPdfProtegido(
        `${import.meta.env.VITE_API_URL}/certificados/download/${certificadoId}?tipo=certificado`,
      );
    } catch {
      await alert({
        message: 'No se pudo abrir el certificado del equipo.',
      });
    }
  };

  // Solo admin y únicamente mientras el equipo está EN_CALIBRACION (la fase
  // previa a las firmas): se borra el documento en BD y el archivo físico.
  const handleEliminarDocumento = async (certificadoId: number) => {
    const ok = await confirm({
      title: 'Eliminar documento',
      message:
        '¿Eliminar este documento del equipo? Esta acción no se puede deshacer.',
    });
    if (!ok) return;
    try {
      await api.delete(`/certificados/${certificadoId}`);
      toast({ message: 'Documento eliminado correctamente.' });
      setCertificados((prev) => prev.filter((c) => c.id !== certificadoId));
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      await alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo eliminar el documento.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-4">
      <div className="bg-white text-foreground border border-border rounded-xl shadow-lg w-[95vw] max-w-[1500px] relative mx-4 flex flex-col">
        {/* ============================================================== */}
        {/* HEADER DEL MODAL */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-muted/30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Detalle del Equipo</h2>
            <span className="text-xs text-muted-foreground">
              Orden N° <span className="font-semibold text-red-600">#{orden.orden_trabajo_fisica}</span>
            </span>
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
          {/* DATOS DEL EQUIPO */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <FlaskConical className="h-4 w-4" />
              Datos del Equipo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <NumeroItem
                label="Código CMEE"
                value={equipo.codigo_cmee || '—'}
                mono
              />
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Descripción
                </span>
                <span className="text-base font-bold text-foreground">
                  {equipo.equipo_descripcion}
                </span>
              </div>
              <NumeroItem label="Marca" value={equipo.marca || '—'} />
              <NumeroItem label="Modelo" value={equipo.modelo || '—'} />
              <NumeroItem
                label="N° de Serie"
                value={equipo.codigo_serie || '—'}
                mono
              />
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Accesorios
                </span>
                <span className="text-base font-semibold">
                  {equipo.accesorios || '—'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Laboratorio Destino
                </span>
                <span className="text-base font-semibold">
                  {equipo.laboratorio?.nombre || '—'}
                </span>
                {equipo.sub_area?.nombre && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({equipo.sub_area.nombre})
                  </span>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Fecha Ingreso Lab
                </span>
                <span className="text-base font-semibold">
                  {formatDate(equipo.fecha_ingreso_laboratorio)}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Técnico Asignado
                </span>
                <span className="text-base font-semibold">
                  {equipo.tecnico
                    ? `${equipo.tecnico.nombre} ${equipo.tecnico.apellidos}`
                    : '—'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Fase actual
                </span>
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
                    ESTADO_COLOR[equipo.estado] ||
                    'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {ESTADO_LABEL[equipo.estado] || equipo.estado}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* DETALLES DE LA CALIBRACIÓN */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <CalendarClock className="h-4 w-4" />
              Detalles de la Calibración
            </h3>

            {/* Requisitos de calibración — bloque destacado */}
            <div className="mb-5 rounded-lg border border-slate-300 bg-white p-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                Requisitos / Parámetros de calibración
              </span>
              {equipo.requerimientos_calibracion ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {equipo.requerimientos_calibracion}
                </p>
              ) : (
                <p className="mt-1 text-sm italic text-muted-foreground/60">
                  Sin requisitos registrados.
                </p>
              )}
            </div>

            {/* Certificados cargados */}
            <div className="mb-5">
              <span className="mb-2 block text-xs font-medium text-slate-400 uppercase tracking-wide">
                Certificados / Reportes cargados ({certificados.length})
              </span>
              {certificados.length > 0 ? (
                <ul className="space-y-2">
                  {certificados.map((c, idx) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        Certificado {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerDocumento(c.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Documento
                        </button>
                        {esAdministrador &&
                          equipo.estado === 'EN_CALIBRACION' && (
                            <button
                              type="button"
                              onClick={() => handleEliminarDocumento(c.id)}
                              title="Eliminar documento"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                            >
                              <FileX className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-muted-foreground/60">
                  Aún no se han cargado certificados para este equipo.
                </p>
              )}
            </div>

            {/* Historial de fases */}
            <div>
              <span className="mb-2 block text-xs font-medium text-slate-400 uppercase tracking-wide">
                Historial de fases
              </span>
              {historial.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-300">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-700 text-white">
                        <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">
                          Fecha
                        </th>
                        <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">
                          Transición
                        </th>
                        <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-500">
                          Acción
                        </th>
                        <th className="px-2 py-1.5 text-left font-semibold">
                          Observaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((h) => {
                        const accionInfo = ACCION_LABEL[h.accion] || {
                          label: h.accion,
                          tone: 'border-gray-300 bg-gray-100 text-gray-600',
                        };
                        return (
                          <tr
                            key={h.id}
                            className="border-b border-slate-200 even:bg-slate-50"
                          >
                            <td className="px-2 py-1.5 border-r border-slate-200 text-xs whitespace-nowrap">
                              {formatDate(h.createdAt)}
                            </td>
                            <td className="px-2 py-1.5 border-r border-slate-200 text-xs">
                              {h.estado_anterior ? (
                                <span>
                                  {ESTADO_LABEL[h.estado_anterior] ||
                                    h.estado_anterior}
                                  {' → '}
                                  <span className="font-semibold text-foreground">
                                    {ESTADO_LABEL[h.estado_nuevo] ||
                                      h.estado_nuevo}
                                  </span>
                                </span>
                              ) : (
                                <span className="font-semibold text-foreground">
                                  {ESTADO_LABEL[h.estado_nuevo] || h.estado_nuevo}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 border-r border-slate-200">
                              <span
                                className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${accionInfo.tone}`}
                              >
                                {accionInfo.label}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-xs text-muted-foreground">
                              {h.observaciones || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground/60">
                  Sin movimientos registrados.
                </p>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* OBSERVACIONES DE LA ORDEN */}
          {/* ---------------------------------------------------------- */}
          {orden.observaciones?.trim() && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Observaciones de la Orden
              </h3>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {orden.observaciones}
              </p>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* CLIENTE — todos los datos del cliente / unidad solicitante */}
          {/* ---------------------------------------------------------- */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <ClienteDatosCard cliente={orden.cliente} />
          </div>
        </div>
      </div>
    </div>
  );
}