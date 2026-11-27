import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

// Pago posterior de una orden entregada "con pago pendiente" (crédito):
// Recepción sube el comprobante y el monto pagado cuando el cliente paga.
// Si la orden ya está facturada, la factura lo recibe como cobro.

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ordenId: number | null;
  ordenFisica?: string;
  /** Monto sin IVA registrado al entregar (referencia para el receptor). */
  montoSinIva?: number | string | null;
}

const API_BASE = import.meta.env.VITE_API_URL as string;

export default function RegistrarPagoModal({
  isOpen,
  onClose,
  ordenId,
  ordenFisica,
  montoSinIva,
}: Props) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [monto, setMonto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setMonto('');
      setEnviando(false);
    }
  }, [isOpen, ordenId]);

  if (!isOpen || !ordenId) return null;

  const montoValido = Number(monto) > 0;
  const referencia = Number(montoSinIva);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !montoValido) return;
    setEnviando(true);
    try {
      const form = new FormData();
      form.append('comprobante', file);
      form.append('monto', monto);
      const res = await fetch(
        `${API_BASE}/recepcion-equipos/orden/${ordenId}/comprobante`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: form,
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Error HTTP ${res.status}`);
      }
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Pago registrado. La orden queda como pagada.' });
      onClose();
    } catch (err) {
      await alert({
        message: (err as Error)?.message || 'No se pudo registrar el pago.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            Registrar pago
            {ordenFisica ? (
              <span className="ml-1 text-muted-foreground">· orden #{ordenFisica}</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={guardar} className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            La orden se entregó con pago pendiente. Suba el comprobante cuando el
            cliente haya pagado.
            {referencia > 0 && (
              <>
                {' '}Monto sin IVA registrado al entregar:{' '}
                <strong className="text-foreground">USD {referencia.toFixed(2)}</strong>.
              </>
            )}
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Comprobante (foto o PDF) <span className="text-destructive">*</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:border-primary/50">
              <Upload className="h-4 w-4" />
              {file ? file.name : 'Seleccionar foto o PDF'}
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label htmlFor="monto-pagado" className="mb-1.5 block text-sm font-medium">
              Monto pagado (USD) <span className="text-destructive">*</span>
            </label>
            <input
              id="monto-pagado"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || !montoValido || enviando}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
