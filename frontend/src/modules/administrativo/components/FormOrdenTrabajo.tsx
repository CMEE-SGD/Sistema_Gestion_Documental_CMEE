import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, UserPlus } from 'lucide-react';
import api from '../../../core/api/axios';
import { getUsuarioActual } from '../../../shared/hooks/useAuth';
import ClienteFormModal, {
  type ClienteInstitucionalCreado,
} from './ClienteFormModal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClienteOption {
  id: number;
  nombre: string;
}

interface LaboratorioOption {
  id: number;
  nombre: string;
}

interface EquipoForm {
  equipo_descripcion: string;
  marca: string;
  modelo: string;
  codigo_serie: string;
  codigo_cmee: string;
  accesorios: string;
  requerimientos_calibracion: string;
  laboratorio_id: string;
  fecha_ingreso_laboratorio: string;
}

interface HeaderForm {
  orden_trabajo_fisica: string;
  n_proforma: string;
  cliente_id: string;
  fecha_ingreso: string;
  recibe_responsable_id: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FormOrdenTrabajo({ onSuccess, onCancel }: Props) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [laboratorios, setLaboratorios] = useState<LaboratorioOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PATCH: Header state — recibe_responsable_id se auto-asigna del usuario logueado
  const [header, setHeader] = useState<HeaderForm>({
    orden_trabajo_fisica: '',
    n_proforma: '',
    cliente_id: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    recibe_responsable_id: String(getUsuarioActual()?.persona_id ?? ''),
  });

  // Detail state — dynamic array of equipos
  const [equipos, setEquipos] = useState<EquipoForm[]>([
    {
      equipo_descripcion: '',
      marca: '',
      modelo: '',
      codigo_serie: '',
      codigo_cmee: '',
      accesorios: '',
      requerimientos_calibracion: '',
      laboratorio_id: '',
      fecha_ingreso_laboratorio: '',
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal de alta rápida de cliente
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // ------------------------------------------------------------------
  // Fetch catalogs on mount
  // ------------------------------------------------------------------
  const fetchClientes = useCallback(async () => {
    const res = await api.get('/clientes-institucionales');
    setClientes(res.data);
    return res.data as ClienteOption[];
  }, []);

  useEffect(() => {
    Promise.all([fetchClientes(), api.get('/laboratorios')]).then(
      ([, resLabs]) => {
        setLaboratorios(resLabs.data);
      },
    );
  }, [fetchClientes]);

  // ------------------------------------------------------------------
  // Alta rápida de cliente — refresca el catálogo y selecciona el nuevo
  // ------------------------------------------------------------------
  const handleClienteCreado = async (cliente: ClienteInstitucionalCreado) => {
    await fetchClientes();
    setHeader((prev) => ({ ...prev, cliente_id: String(cliente.id) }));
    if (errors.cliente_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cliente_id;
        return next;
      });
    }
  };

  // ------------------------------------------------------------------
  // Header handlers
  // ------------------------------------------------------------------
  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  // ------------------------------------------------------------------
  // Equipo dynamic array handlers (immutable updates)
  // ------------------------------------------------------------------
  const handleEquipoChange = (
    index: number,
    field: keyof EquipoForm,
    value: string,
  ) => {
    setEquipos((prev) =>
      prev.map((eq, i) => (i === index ? { ...eq, [field]: value } : eq)),
    );
  };

  const addEquipo = () => {
    setEquipos((prev) => [
      ...prev,
      {
        equipo_descripcion: '',
        marca: '',
        modelo: '',
        codigo_serie: '',
        codigo_cmee: '',
        accesorios: '',
        requerimientos_calibracion: '',
        laboratorio_id: '',
        fecha_ingreso_laboratorio: '',
      },
    ]);
  };

  const removeEquipo = (index: number) => {
    setEquipos((prev) => prev.filter((_, i) => i !== index));
  };

  // ------------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post('/recepcion-equipos', {
        orden_trabajo_fisica: header.orden_trabajo_fisica.trim(),
        n_proforma: header.n_proforma.trim() || undefined,
        cliente_id: Number(header.cliente_id),
        fecha_ingreso: header.fecha_ingreso || undefined,
        recibe_responsable_id: header.recibe_responsable_id
          ? Number(header.recibe_responsable_id)
          : undefined,
        equipos: equipos.map((eq) => ({
          equipo_descripcion: eq.equipo_descripcion.trim(),
          marca: eq.marca.trim() || undefined,
          modelo: eq.modelo.trim() || undefined,
          codigo_serie: eq.codigo_serie.trim() || undefined,
          codigo_cmee: eq.codigo_cmee.trim() || undefined,
          accesorios: eq.accesorios.trim() || undefined,
          requerimientos_calibracion:
            eq.requerimientos_calibracion.trim() || undefined,
          laboratorio_id: Number(eq.laboratorio_id),
          fecha_ingreso_laboratorio:
            eq.fecha_ingreso_laboratorio || undefined,
        })),
      });

      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      alert(
        apiErr?.response?.data?.message || 'Error al guardar la orden de trabajo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  const inputClass = (field: string) =>
    `block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      errors[field] ? 'border-destructive' : 'border-input'
    }`;

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ============================================================== */}
      {/* SECTION 1: DATOS DE LA ORDEN (Cabecera) */}
      {/* ============================================================== */}
      {/* PATCH: card bg-white p-6 rounded-lg shadow-sm */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <h2 className="mb-5 text-base font-semibold text-foreground">
          Datos de la Orden (Cabecera)
        </h2>

        {/* PATCH: grid de 4 columnas para los campos de cabecera */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* N° Orden Física */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              N° Orden Física <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="orden_trabajo_fisica"
              placeholder="Ej: 0013679"
              value={header.orden_trabajo_fisica}
              onChange={handleHeaderChange}
              className={`${inputClass('orden_trabajo_fisica')} font-bold text-red-600`}
            />
            {errors.orden_trabajo_fisica && (
              <p className="mt-1 text-xs text-destructive">
                {errors.orden_trabajo_fisica}
              </p>
            )}
          </div>

          {/* N° Proforma */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              N° Proforma
            </label>
            <input
              type="text"
              name="n_proforma"
              placeholder="Ej: SAC-007"
              value={header.n_proforma}
              onChange={handleHeaderChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Cliente / Unidad */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Cliente / Unidad <span className="text-destructive">*</span>
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
              name="cliente_id"
              value={header.cliente_id}
              onChange={handleHeaderChange}
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

          {/* Fecha de Ingreso */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Fecha de Ingreso
            </label>
            <input
              type="date"
              name="fecha_ingreso"
              value={header.fecha_ingreso}
              onChange={handleHeaderChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* PATCH: hidden input para recibe_responsable_id (auto-asignado del usuario logueado) */}
        <input
          type="hidden"
          name="recibe_responsable_id"
          value={header.recibe_responsable_id}
        />
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: EQUIPOS A CALIBRAR (Detalle) */}
      {/* ============================================================== */}
      {/* PATCH: card bg-white p-6 rounded-lg shadow-sm */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between mb-5">
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

        {/* PATCH: overflow-x-auto para evitar ruptura en pantallas estrechas */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {/* PATCH: min-w por columna para legibilidad */}
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
                  key={i}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  {/* PATCH: orden de columnas según layout Excel */}
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
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <input
                      type="date"
                      value={eq.fecha_ingreso_laboratorio}
                      onChange={(e) =>
                        handleEquipoChange(i, 'fecha_ingreso_laboratorio', e.target.value)
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
                      title="Eliminar equipo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PATCH: botón alternativo para agregar al final del detalle */}
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

      {/* ============================================================== */}
      {/* FOOTER */}
      {/* ============================================================== */}
      {/* PATCH: card bg-white p-6 rounded-lg shadow-sm */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            'Guardar Orden'
          )}
        </button>
      </div>
    </form>

    <ClienteFormModal
      open={isClienteModalOpen}
      onClose={() => setIsClienteModalOpen(false)}
      onSuccess={handleClienteCreado}
    />
    </>
  );
}
