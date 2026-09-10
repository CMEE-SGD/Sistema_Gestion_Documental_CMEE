import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recepcionId: number | null;
  laboratorioId?: number | null;
  onSuccess: () => void;
}

const API_BASE = (import.meta as any).env.VITE_API_URL;

interface ServicioOption {
  id: number;
  nombre: string | null;
  magnitud: string | null;
  descripcion: string | null;
  laboratorio_id: number;
  activo: boolean;
}

function ZonaArchivo({
  file,
  inputRef,
  onSelect,
  onChange,
  onDrop,
}: {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onSelect: (file: File | null) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
        file
          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-accent/30',
      )}
    >
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-xs text-destructive hover:underline"
          >
            Quitar archivo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Haga clic o arrastre un archivo
          </p>
          <p className="text-xs text-muted-foreground">
            Solo PDF &middot; Máximo 10 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}

export default function SubirCertificadoModal({
  isOpen,
  onClose,
  recepcionId,
  laboratorioId,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [servicioId, setServicioId] = useState<string>('');

  const { data: servicios } = useQuery({
    queryKey: ['servicios', 'subir-certificado', laboratorioId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/servicios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err ?? { message: `Error HTTP ${res.status}` };
      }
      return res.json() as Promise<ServicioOption[]>;
    },
    enabled: isOpen,
  });

  const serviciosDelLab =
    servicios?.filter(
      (s) =>
        s.activo &&
        (laboratorioId == null || s.laboratorio_id === laboratorioId),
    ) ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file || !recepcionId) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recepcion_equipo_id', recepcionId.toString());
      if (servicioId) formData.append('servicio_id', servicioId);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/certificados/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw errorBody ?? { message: `Error HTTP ${res.status}` };
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Certificado subido correctamente.' });
      onSuccess();
      onClose();
    },
    onError: async (err: unknown) => {
      const apiErr = err as any;
      console.error('Error al subir certificado:', apiErr);
      await alert({ message: apiErr?.message || 'Error al subir el certificado' });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== 'application/pdf') {
      await alert({ message: 'Solo se permiten archivos PDF' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selected);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped && dropped.type !== 'application/pdf') {
      await alert({ message: 'Solo se permiten archivos PDF' });
      return;
    }
    setFile(dropped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (!servicioId) return;
    mutation.mutate();
  };

  if (!isOpen || !recepcionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Subir certificado</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Seleccione el PDF con el reporte de calibración y el
              certificado ya combinados en un solo documento. El técnico, el
              jefe de laboratorio y el director firman ese mismo archivo en
              cada etapa del proceso.
            </p>

            {/* Procedimiento */}
            <div>
              <label
                htmlFor="procedimiento"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Procedimiento utilizado{' '}
                <span className="text-destructive">*</span>
              </label>
              <select
                id="procedimiento"
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seleccione el procedimiento...</option>
                {serviciosDelLab.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.magnitud ?? s.nombre ?? `Procedimiento #${s.id}`}
                    {s.descripcion ? ` — ${s.descripcion}` : ''}
                  </option>
                ))}
              </select>
              {serviciosDelLab.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No hay procedimientos activos para este laboratorio.
                </p>
              )}
              {!servicioId && (
                <p className="mt-1 text-xs text-destructive">
                  Debe seleccionar el procedimiento al subir el certificado
                </p>
              )}
            </div>

            {/* Reporte + certificado (un solo PDF) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Reporte y certificado de calibración{' '}
                <span className="text-destructive">*</span>
              </label>
              <ZonaArchivo
                file={file}
                inputRef={fileInputRef}
                onSelect={setFile}
                onChange={handleFileChange}
                onDrop={handleDrop}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || !servicioId || mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Subir certificado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
