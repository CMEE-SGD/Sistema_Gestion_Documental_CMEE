import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import api from '../../../core/api/axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClienteFormState {
  nombre: string;
  ruc: string;
  representante: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface ClienteInstitucionalCreado {
  id: number;
  nombre: string;
  ruc: string | null;
  representante: string;
  direccion: string;
  telefono: string;
  email: string | null;
  tipo: 'CIVIL' | 'MILITAR';
  activo: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (cliente: ClienteInstitucionalCreado) => void;
}

const EMPTY_FORM: ClienteFormState = {
  nombre: '',
  ruc: '',
  representante: '',
  direccion: '',
  telefono: '',
  email: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClienteFormModal({ open, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ClienteFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: ClienteFormState) => {
      const res = await api.post<ClienteInstitucionalCreado>(
        '/clientes-institucionales',
        {
          nombre: data.nombre.trim(),
          ruc: data.ruc.trim() || undefined,
          representante: data.representante.trim(),
          direccion: data.direccion.trim(),
          telefono: data.telefono.trim(),
          email: data.email.trim() || undefined,
        },
      );
      return res.data;
    },
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes-institucionales'] });
      setForm(EMPTY_FORM);
      setErrors({});
      onSuccess?.(cliente);
      onClose();
    },
  });

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.representante.trim())
      errs.representante = 'El representante es obligatorio';
    if (!form.direccion.trim()) errs.direccion = 'La dirección es obligatoria';
    if (!form.telefono.trim()) errs.telefono = 'El teléfono es obligatorio';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      errs.email = 'El correo electrónico no tiene un formato válido';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    mutation.reset();
    onClose();
  };

  const inputClass = (field: string) =>
    `block w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      errors[field] ? 'border-destructive' : 'border-input'
    }`;

  const apiErrorMessage =
    mutation.isError &&
    ((mutation.error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? 'Error al guardar el cliente');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-4 backdrop-blur-sm">
      <div className="relative mx-4 flex w-full max-w-2xl flex-col rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Nuevo Cliente</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            {apiErrorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {apiErrorMessage}
              </div>
            )}

            {/* Nombre — fila completa */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre / Razón Social <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                placeholder="Ej: Empresa Nacional de Metrología S.A."
                value={form.nombre}
                onChange={handleChange}
                className={inputClass('nombre')}
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-destructive">{errors.nombre}</p>
              )}
            </div>

            {/* RUC / Teléfono */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  RUC
                </label>
                <input
                  type="text"
                  name="ruc"
                  placeholder="Ej: 1790012345001"
                  value={form.ruc}
                  onChange={handleChange}
                  className={inputClass('ruc')}
                />
                {errors.ruc && (
                  <p className="mt-1 text-xs text-destructive">{errors.ruc}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Teléfono <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Ej: 022345678"
                  value={form.telefono}
                  onChange={handleChange}
                  className={inputClass('telefono')}
                />
                {errors.telefono && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Representante / Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Representante <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="representante"
                  placeholder="Ej: Juan Pérez"
                  value={form.representante}
                  onChange={handleChange}
                  className={inputClass('representante')}
                />
                {errors.representante && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.representante}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Ej: contacto@empresa.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Dirección — fila completa */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Dirección <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Ej: Av. Amazonas N32-15 y Av. Atahualpa"
                value={form.direccion}
                onChange={handleChange}
                className={inputClass('direccion')}
              />
              {errors.direccion && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.direccion}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-border bg-muted/30 p-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
