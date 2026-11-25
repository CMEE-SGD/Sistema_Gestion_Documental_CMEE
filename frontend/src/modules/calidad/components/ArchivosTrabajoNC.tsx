import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Loader2, Paperclip, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

// Documentos de respaldo de un trabajo no conforme (sección 4. Seguimiento).
// Acepta cualquier formato: PDF, Word, Excel, imágenes, comprimidos, etc.

interface ArchivoTNC {
  id: number;
  nombre_original: string;
  tamano: number;
  createdAt: string;
}

const MAX_ARCHIVOS = 10;
const MAX_MB = 25;

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  trabajoId: number;
  puedeEditar: boolean;
}

export function ArchivosTrabajoNC({ trabajoId, puedeEditar }: Props) {
  const { alert, pedirMotivo } = useAlert();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<ArchivoTNC[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [descargando, setDescargando] = useState<number | null>(null);

  const base = `/calidad/trabajos-no-conformes/${trabajoId}/archivos`;

  useEffect(() => {
    let vivo = true;
    api
      .get<ArchivoTNC[]>(base)
      .then((r) => vivo && setArchivos(r.data))
      .catch(() => vivo && setArchivos([]))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [base]);

  const subir = async (lista: FileList | null) => {
    if (!lista || lista.length === 0) return;
    const files = Array.from(lista);
    if (files.length > MAX_ARCHIVOS) {
      await alert({ message: `Puede subir hasta ${MAX_ARCHIVOS} archivos a la vez.` });
      return;
    }
    const grande = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (grande) {
      await alert({ message: `"${grande.name}" supera el máximo de ${MAX_MB} MB por archivo.` });
      return;
    }
    const datos = new FormData();
    files.forEach((f) => datos.append('archivos', f));
    setSubiendo(true);
    try {
      const r = await api.post<ArchivoTNC[]>(base, datos, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setArchivos(r.data);
      toast({ message: files.length === 1 ? 'Documento subido.' : `${files.length} documentos subidos.` });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      await alert({ message: e?.response?.data?.message || 'No se pudieron subir los documentos.' });
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const descargar = async (a: ArchivoTNC) => {
    setDescargando(a.id);
    try {
      const r = await api.get(`${base}/${a.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data as Blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = a.nombre_original;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      await alert({ message: 'No se pudo descargar el documento.' });
    } finally {
      setDescargando(null);
    }
  };

  const eliminar = async (a: ArchivoTNC) => {
    const motivo = await pedirMotivo({
      title: 'Eliminar documento',
      message: `¿Eliminar "${a.nombre_original}"?`,
      confirmLabel: 'Eliminar',
    });
    if (!motivo) return;
    try {
      await api.delete(`${base}/${a.id}`, { motivo });
      setArchivos((prev) => prev.filter((x) => x.id !== a.id));
      toast({ message: 'Documento eliminado.' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      await alert({ message: e?.response?.data?.message || 'No se pudo eliminar el documento.' });
    }
  };

  return (
    <div className="md:col-span-3 border-t border-gray-200 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-gray-700">Documentos de respaldo:</span>
        {puedeEditar && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => subir(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
              title={`Cualquier formato, hasta ${MAX_ARCHIVOS} archivos de ${MAX_MB} MB`}
            >
              {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              {subiendo ? 'Subiendo…' : 'Adjuntar documentos'}
            </button>
          </>
        )}
      </div>

      {cargando ? (
        <p className="mt-2 text-gray-400">Cargando…</p>
      ) : archivos.length === 0 ? (
        <p className="mt-2 text-gray-400">
          Sin documentos.{puedeEditar ? ' Puede adjuntar archivos de cualquier formato.' : ''}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-gray-100 rounded border border-gray-200">
          {archivos.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate text-gray-700" title={a.nombre_original}>
                {a.nombre_original}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {formatearTamano(a.tamano)} · {new Date(a.createdAt).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => descargar(a)}
                disabled={descargando === a.id}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                title="Descargar"
              >
                {descargando === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </button>
              {puedeEditar && (
                <button
                  type="button"
                  onClick={() => eliminar(a)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
