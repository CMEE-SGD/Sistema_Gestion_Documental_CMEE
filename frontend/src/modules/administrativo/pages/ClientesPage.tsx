import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building2, Inbox, Plus } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import ClienteFormModal from '../components/ClienteFormModal';

// ---------------------------------------------------------------------------
// Types — reflejan los campos del documento físico oficial del laboratorio
// ---------------------------------------------------------------------------

interface ClienteInstitucional {
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

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

function useClientesInstitucionales() {
  return useQuery<ClienteInstitucional[]>({
    queryKey: ['clientes-institucionales'],
    queryFn: async () => {
      const res = await api.get<ClienteInstitucional[]>(
        '/clientes-institucionales',
      );
      return res.data;
    },
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TH({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted-foreground/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No hay clientes registrados
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre un nuevo cliente para poder generar órdenes de trabajo.
          </p>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const COLS = 5;

export default function ClientesPage() {
  const { data: clientes, isLoading, isError, error } =
    useClientesInstitucionales();

  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Clientes Corporativos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Unidades e instituciones habilitadas para generar órdenes de
              trabajo
            </p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error banner */}
      {/* ------------------------------------------------------------------ */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar los clientes. Intente nuevamente.'}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table card */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <TH>Nombre</TH>
                <TH>RUC</TH>
                <TH>Representante</TH>
                <TH>Teléfono</TH>
                <TH className="text-center">Estado</TH>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton cols={COLS} />
              ) : clientes && clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                      {cliente.nombre}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {cliente.ruc || (
                        <span className="italic text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {cliente.representante}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {cliente.telefono}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          cliente.activo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        )}
                      >
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState cols={COLS} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal — Nuevo Cliente */}
      {/* ------------------------------------------------------------------ */}
      <ClienteFormModal open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
