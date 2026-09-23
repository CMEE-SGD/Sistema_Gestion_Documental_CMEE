// Modal de edición directa de una orden de trabajo y sus equipos.
// Administrador: PATCH directo a /recepcion-equipos/:id (sin pasar por el
// flujo de estados). Edita la cabecera Y los datos de cada equipo; también
// permite agregar equipos nuevos a la orden. La fase de cada equipo no se
// toca desde aquí (se mueve con el flujo o con "cambiar fase" del admin).

import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import type { OrdenTrabajoDetalle } from './VistaDetalleOrden';
import ClienteFormModal from './ClienteFormModal';

interface Props {
  orden: OrdenTrabajoDetalle | null;
  onClose: () => void;
}

interface ClienteOption {
  id: number;
  nombre: string;
}

interface LaboratorioOption {
  id: number;
  nombre: string;
}

interface SubAreaOption {
  id: number;
  codigo: string;
  nombre: string;
}

// Equipo editable — los valores de formulario son strings; `id` presente
// significa que es un equipo ya existente (se actualiza) y ausente que es
// uno nuevo (se crea).
interface EquipoEdit {
  id?: number;
  equipo_descripcion: string;
  marca: string;
  modelo: string;
  codigo_serie: string;
  codigo_cmee: string;
  accesorios: string;
  requerimientos_calibracion: string;
  laboratorio_id: string;
  sub_area_id: string;
  fecha_ingreso_laboratorio: string;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nuevoEquipoVacio(): EquipoEdit {
  return {
    equipo_descripcion: '',
    marca: '',
    modelo: '',
    codigo_serie: '',
    codigo_cmee: '',
    accesorios: '',
    requerimientos_calibracion: '',
    laboratorio_id: '',
    sub_area_id: '',
    fecha_ingreso_laboratorio: '',
  };
}

// Equipo como viene en la orden a editar — el detalle del backend incluye
// sub_area_id aunque el tipo base de VistaDetalleOrden no lo declare.
type EquipoDetalleConSubArea = OrdenTrabajoDetalle['equipos'][number] & {
  sub_area_id?: number | null;
};

export default function EditarOrdenModal({ orden, onClose }: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();

  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [laboratorios, setLaboratorios] = useState<LaboratorioOption[]>([]);
  // Proformas del módulo financiero — catálogo silencioso: si el usuario no
  // tiene acceso al módulo financiero, el vínculo queda vacío sin romper nada.
  const [proformas, setProformas] = useState<
    { id: number; numero: string; cliente_id: number }[]
  >([]);

  const [equipos, setEquipos] = useState<EquipoEdit[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // Sub-áreas por laboratorio — cargadas bajo demanda (igual que en el
  // formulario de creación).
  const [subAreasPorLab, setSubAreasPorLab] = useState<
    Record<number, SubAreaOption[]>
  >({});

  const cargarSubAreas = useCallback(
    async (laboratorioId: number) => {
      if (subAreasPorLab[laboratorioId]) return;
      try {
        const res = await api.get(`/laboratorios/${laboratorioId}/sub-areas`);
        setSubAreasPorLab((prev) => ({ ...prev, [laboratorioId]: res.data }));
      } catch {
        // Sin sub-áreas para elegir; el equipo sigue asignado al laboratorio.
      }
    },
    [subAreasPorLab],
  );

  // ── Catálogos: se cargan al abrir el modal ──────────────────────────
  useEffect(() => {
    if (!orden) return;
    let activo = true;
    Promise.all([
      api.get('/clientes-institucionales'),
      api.get('/laboratorios'),
    ])
      .then(([resClientes, resLabs]) => {
        if (!activo) return;
        setClientes(resClientes.data);
        setLaboratorios(resLabs.data);
      })
      .catch(async (err: unknown) => {
        if (!activo) return;
        const apiErr = err as { response?: { data?: { message?: string } } };
        await alert({
          message:
            apiErr?.response?.data?.message ||
            'No se pudieron cargar los catálogos de clientes/laboratorios.',
        });
      });
    return () => {
      activo = false;
    };
  }, [orden, alert]);

  // Proformas del módulo financiero — catálogo silencioso (ver comentario
  // junto al estado): si el usuario no tiene acceso al módulo financiero, el
  // vínculo queda vacío sin romper el registro de la orden.
  useEffect(() => {
    api
      .get('/facturacion/proformas')
      .then((res) => setProformas(res.data))
      .catch(() => setProformas([]));
  }, []);

  const [header, setHeader] = useState({
    orden_trabajo_fisica: '',
    n_proforma: '',
    proforma_id: '',
    cliente_id: '',
    fecha_ingreso: '',
    observaciones: '',
  });

  // ── Sembrar el formulario cuando llega la orden a editar ────────────
  useEffect(() => {
    if (!orden) return;
    setHeader({
      orden_trabajo_fisica: orden.orden_trabajo_fisica ?? '',
      n_proforma: orden.n_proforma ?? '',
      proforma_id: (orden as any).proforma_id
        ? String((orden as any).proforma_id)
        : '',
      cliente_id: orden.cliente_id ? String(orden.cliente_id) : '',
      fecha_ingreso: toDateInput(orden.fecha_ingreso),
      observaciones: orden.observaciones ?? '',
    });

    const ordenEquipos = (orden.equipos ?? []) as EquipoDetalleConSubArea[];
    const filas: EquipoEdit[] = ordenEquipos.map((eq) => ({
      id: eq.id,
      equipo_descripcion: eq.equipo_descripcion ?? '',
      marca: eq.marca ?? '',
      modelo: eq.modelo ?? '',
      codigo_serie: eq.codigo_serie ?? '',
      codigo_cmee: eq.codigo_cmee ?? '',
      accesorios: eq.accesorios ?? '',
      requerimientos_calibracion: eq.requerimientos_calibracion ?? '',
      laboratorio_id: eq.laboratorio_id ? String(eq.laboratorio_id) : '',
      sub_area_id: eq.sub_area_id ? String(eq.sub_area_id) : '',
      fecha_ingreso_laboratorio: toDateInput(eq.fecha_ingreso_laboratorio),
    }));
    setEquipos(filas.length > 0 ? filas : [nuevoEquipoVacio()]);
    setErrors({});

    // Precargar sub-áreas de los laboratorios ya asignados
    for (const eq of ordenEquipos) {
      if (eq.laboratorio_id && eq.sub_area_id) {
        cargarSubAreas(eq.laboratorio_id);
      }
    }
  }, [orden, cargarSubAreas]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/recepcion-equipos/${orden!.id}`, {
        orden_trabajo_fisica: header.orden_trabajo_fisica.trim(),
        n_proforma: header.n_proforma.trim() || undefined,
        proforma_id: header.proforma_id
          ? Number(header.proforma_id)
          : undefined,
        cliente_id: Number(header.cliente_id),
        fecha_ingreso: header.fecha_ingreso || undefined,
        observaciones: header.observaciones.trim() || undefined,
        equipos: equipos.map((eq) => ({
          id: eq.id ?? undefined,
          equipo_descripcion: eq.equipo_descripcion.trim(),
          marca: eq.marca.trim() || undefined,
          modelo: eq.modelo.trim() || undefined,
          codigo_serie: eq.codigo_serie.trim() || undefined,
          codigo_cmee: eq.codigo_cmee.trim() || undefined,
          accesorios: eq.accesorios.trim() || undefined,
          requerimientos_calibracion:
            eq.requerimientos_calibracion.trim() || undefined,
          laboratorio_id: Number(eq.laboratorio_id),
          sub_area_id: eq.sub_area_id ? Number(eq.sub_area_id) : null,
          fecha_ingreso_laboratorio:
            eq.fecha_ingreso_laboratorio || undefined,
        })),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Orden de trabajo actualizada correctamente.' });
      onClose();
    },
    onError: async (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      await alert({
        message:
          apiErr?.response?.data?.message ||
          'Error al actualizar la orden de trabajo',
      });
    },
  });

  if (!orden) return null;

  // ── Handlers de equipos (arreglo dinámico) ──────────────────────────
  const handleEquipoChange = (
    index: number,
    field: keyof EquipoEdit,
    value: string,
  ) => {
    if (field === 'laboratorio_id') {
      setEquipos((prev) =>
        prev.map((eq, i) =>
          i === index ? { ...eq, laboratorio_id: value, sub_area_id: '' } : eq,
        ),
      );
      if (value) cargarSubAreas(Number(value));
      return;
    }
    setEquipos((prev) =>
      prev.map((eq, i) => (i === index ? { ...eq, [field]: value } : eq)),
    );
  };

  const addEquipo = () => setEquipos((prev) => [...prev, nuevoEquipoVacio()]);

  const removeEquipo = (index: number) =>
    setEquipos((prev) => prev.filter((_, i) => i !== index));

  // ── Validación ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!header.orden_trabajo_fisica.trim())
      errs.orden_trabajo_fisica = 'El número de orden es obligatorio';
    if (!header.cliente_id) errs.cliente_id = 'Seleccione un cliente';

    equipos.forEach((eq, i) => {
      if (!eq.equipo_descripcion.trim())
        errs[`equipos.${i}.equipo_descripcion`] = 'Descripción requerida';
      if (!eq.laboratorio_id)
        errs[`equipos.${i}.laboratorio_id`] = 'Seleccione un laboratorio';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  const inputClass = (field: string) =>
    `block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      errors[field] ? 'border-destructive' : 'border-input'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-sm bg-black/40 py-4">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-[95vw] max-w-[1500px] min-h-[85vh] relative mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">Editar Orden de Trabajo</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-auto p-6">
            <p className="text-sm text-muted-foreground">
              Edición directa de la orden y sus equipos. Los cambios se guardan
              de inmediato. La fase de cada equipo no se modifica aquí.
            </p>

            {/* ========================================================== */}
            {/* CABECERA */}
            {/* ========================================================== */}
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-foreground">
                Datos de la Orden (Cabecera)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    N° Orden Física <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={header.orden_trabajo_fisica}
                    onChange={(e) =>
                      setHeader({ ...header, orden_trabajo_fisica: e.target.value })
                    }
                    className={`${inputClass('orden_trabajo_fisica')} font-bold text-red-600`}
                  />
                  {errors.orden_trabajo_fisica && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.orden_trabajo_fisica}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    N° Proforma
                  </label>
                  <input
                    type="text"
                    value={header.n_proforma}
                    onChange={(e) =>
                      setHeader({ ...header, n_proforma: e.target.value })
                    }
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <label className="mb-1.5 mt-2 block text-sm font-medium text-foreground">
                    Proforma (vínculo formal)
                  </label>
                  <select
                    value={header.proforma_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const pf = proformas.find((p) => p.id === Number(id));
                      setHeader((prev) => ({
                        ...prev,
                        proforma_id: id,
                        n_proforma: pf ? pf.numero : prev.n_proforma,
                      }));
                    }}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">— Sin proforma —</option>
                    {proformas
                      .filter((p) => String(p.cliente_id) === header.cliente_id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.numero}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">
                      Cliente / Unidad{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsClienteModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Nuevo Cliente
                    </button>
                  </div>
                  <select
                    value={header.cliente_id}
                    onChange={(e) =>
                      setHeader({ ...header, cliente_id: e.target.value })
                    }
                    className={inputClass('cliente_id')}
                  >
                    <option value="">Seleccione un cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.cliente_id && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.cliente_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={header.fecha_ingreso}
                    onChange={(e) =>
                      setHeader({ ...header, fecha_ingreso: e.target.value })
                    }
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Observaciones generales de la orden */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Notas adicionales sobre la recepción (opcional)…"
                  value={header.observaciones}
                  onChange={(e) =>
                    setHeader({ ...header, observaciones: e.target.value })
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* ========================================================== */}
            {/* EQUIPOS */}
            {/* ========================================================== */}
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Equipos a Calibrar (Detalle)
                </h2>
                <button
                  type="button"
                  onClick={addEquipo}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Equipo
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-3 min-w-[140px]">Código CMEE</th>
                      <th className="px-3 py-3 min-w-[180px]">Descripción</th>
                      <th className="px-3 py-3 min-w-[120px]">Marca</th>
                      <th className="px-3 py-3 min-w-[120px]">Modelo</th>
                      <th className="px-3 py-3 min-w-[120px]">Serie</th>
                      <th className="px-3 py-3 min-w-[150px]">Accesorios</th>
                      <th className="px-3 py-3 min-w-[150px]">Req. Calibración</th>
                      <th className="px-3 py-3 min-w-[180px]">Laboratorio Destino</th>
                      <th className="px-3 py-3 min-w-[150px]">Fecha Ingreso Lab</th>
                      <th className="px-3 py-3 min-w-[60px] text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipos.map((eq, i) => (
                      <tr
                        key={eq.id ?? `nuevo-${i}`}
                        className="border-b border-border transition-colors hover:bg-muted/50"
                      >
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="CMEE26.002-2"
                            value={eq.codigo_cmee}
                            onChange={(e) =>
                              handleEquipoChange(i, 'codigo_cmee', e.target.value)
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="Nombre del equipo"
                            value={eq.equipo_descripcion}
                            onChange={(e) =>
                              handleEquipoChange(i, 'equipo_descripcion', e.target.value)
                            }
                            className={inputClass(`equipos.${i}.equipo_descripcion`)}
                          />
                          {errors[`equipos.${i}.equipo_descripcion`] && (
                            <p className="mt-1 text-xs text-destructive">
                              {errors[`equipos.${i}.equipo_descripcion`]}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="TAYLOR"
                            value={eq.marca}
                            onChange={(e) =>
                              handleEquipoChange(i, 'marca', e.target.value)
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="9810"
                            value={eq.modelo}
                            onChange={(e) =>
                              handleEquipoChange(i, 'modelo', e.target.value)
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="12110652"
                            value={eq.codigo_serie}
                            onChange={(e) =>
                              handleEquipoChange(i, 'codigo_serie', e.target.value)
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="CON SONDA"
                            value={eq.accesorios}
                            onChange={(e) =>
                              handleEquipoChange(i, 'accesorios', e.target.value)
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="text"
                            placeholder="200seg, 600seg"
                            value={eq.requerimientos_calibracion}
                            onChange={(e) =>
                              handleEquipoChange(
                                i,
                                'requerimientos_calibracion',
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <select
                            value={eq.laboratorio_id}
                            onChange={(e) =>
                              handleEquipoChange(i, 'laboratorio_id', e.target.value)
                            }
                            className={inputClass(`equipos.${i}.laboratorio_id`)}
                          >
                            <option value="">Seleccione…</option>
                            {laboratorios.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.nombre}
                              </option>
                            ))}
                          </select>
                          {errors[`equipos.${i}.laboratorio_id`] && (
                            <p className="mt-1 text-xs text-destructive">
                              {errors[`equipos.${i}.laboratorio_id`]}
                            </p>
                          )}
                          {(() => {
                            const opciones = eq.laboratorio_id
                              ? subAreasPorLab[Number(eq.laboratorio_id)]
                              : undefined;
                            if (!opciones || opciones.length < 2) return null;
                            return (
                              <select
                                value={eq.sub_area_id}
                                onChange={(e) =>
                                  handleEquipoChange(i, 'sub_area_id', e.target.value)
                                }
                                className="mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <option value="">Sub-área: sin especificar</option>
                                {opciones.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.nombre}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <input
                            type="date"
                            value={eq.fecha_ingreso_laboratorio}
                            onChange={(e) =>
                              handleEquipoChange(
                                i,
                                'fecha_ingreso_laboratorio',
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center align-top">
                          <button
                            type="button"
                            onClick={() => removeEquipo(i)}
                            disabled={equipos.length === 1}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                            title={eq.id ? 'Quitar de la edición' : 'Eliminar equipo'}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {equipos.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={addEquipo}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:hidden"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar otro equipo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      <ClienteFormModal
        open={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        onSuccess={(cliente) => {
          setHeader((prev) => ({ ...prev, cliente_id: String(cliente.id) }));
          setIsClienteModalOpen(false);
        }}
      />
    </div>
  );
}