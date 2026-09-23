import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CircleCheck, CircleX, FileMinus, Upload } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import {
  FACTURA_REAL_262,
  FACTURA_REAL_263,
  FACTURA_REAL_264,
  FACTURA_REAL_265,
  NOTA_CREDITO_010,
} from '../datosDemo';
import { useFinanciero } from '../FinancieroDemoContext';
import { vencimientoDe } from '../calculos';
import { fmtFecha, fmtUSD } from '../formato';
import { Boton, Modal } from '../ui';
import type { Factura, NotaCredito } from '../tipos';

type Veredicto = 'FACTURA' | 'NOTA' | 'DUPLICADA' | 'RECHAZADA';

interface Resultado {
  archivo: string;
  veredicto: Veredicto;
  mensaje: string;
  resumen?: ReactNode;
  factura?: Omit<Factura, 'id'>;
  nota?: Omit<NotaCredito, 'id'>;
}

export default function SubirXmlModal({
  onCerrar,
  onGuardado,
}: {
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const { facturas, notasSueltas, agregarDocumentos } = useFinanciero();
  const [revisando, setRevisando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const resultados: Resultado[] = useMemo(() => {
    const existeFactura = (numero: string) => facturas.some((f) => f.numero === numero);
    const existeNota = (numero: string) =>
      facturas.some((f) => f.creditos.some((c) => c.numero === numero)) ||
      notasSueltas.some((n) => n.numero === numero);

    const deFactura = (f: Omit<Factura, 'id'>): Resultado => {
      const archivo = `FAC ${f.numero}.xml`;
      if (existeFactura(f.numero)) {
        return {
          archivo,
          veredicto: 'DUPLICADA',
          mensaje: 'Ya está registrada: la clave de acceso se repite. No se guardará de nuevo.',
        };
      }
      return {
        archivo,
        veredicto: 'FACTURA',
        mensaje: f.clienteRegistrado
          ? 'Factura lista para guardar.'
          : 'Factura lista para guardar. El cliente aún no está en el sistema: se usará la razón social del XML.',
        resumen: `${f.clienteNombre}, ${fmtUSD(f.total)}, vence el ${fmtFecha(vencimientoDe({ ...f, id: 0 }))}`,
        factura: f,
      };
    };

    const deNota = (n: Omit<NotaCredito, 'id'>): Resultado => {
      const archivo = `NCT ${n.numero}.xml`;
      if (existeNota(n.numero)) {
        return {
          archivo,
          veredicto: 'DUPLICADA',
          mensaje: 'Esta nota de crédito ya está registrada. No se guardará de nuevo.',
        };
      }
      const destino = facturas.find((f) => f.numero === n.facturaModificada);
      const mensaje = !destino
        ? `Nota de crédito. La factura ${n.facturaModificada} no está registrada: la nota se guarda y se aplicará cuando la cargues.`
        : n.valor >= destino.total - 0.005
          ? `Nota de crédito por el total. La factura ${destino.numero} quedará anulada.`
          : `Nota de crédito parcial. Baja el saldo de la factura ${destino.numero}.`;
      return {
        archivo,
        veredicto: 'NOTA',
        mensaje,
        resumen: `${n.clienteNombre}, ${fmtUSD(n.valor)}, motivo: ${n.motivo}`,
        nota: n,
      };
    };

    return [
      deFactura(FACTURA_REAL_262),
      deFactura(FACTURA_REAL_263),
      deFactura(FACTURA_REAL_264),
      deFactura(FACTURA_REAL_265),
      deNota(NOTA_CREDITO_010),
      // Ejemplos de error para mostrar las validaciones (no son archivos reales).
      existeFactura('001-005-000000255')
        ? {
            archivo: 'FAC 001-005-000000255.xml',
            veredicto: 'DUPLICADA' as const,
            mensaje: 'Ya está registrada: la clave de acceso se repite. No se guardará de nuevo.',
          }
        : {
            archivo: 'FAC 001-005-000000255.xml',
            veredicto: 'RECHAZADA' as const,
            mensaje: 'No se pudo leer el comprobante.',
          },
      {
        archivo: 'FAC 001-005-000000266.xml',
        veredicto: 'RECHAZADA' as const,
        mensaje: 'El SRI no autorizó este comprobante. Pide a Contífico el XML autorizado.',
      },
    ];
  }, [facturas, notasSueltas]);

  const nuevasFacturas = resultados.filter((r) => r.veredicto === 'FACTURA');
  const nuevasNotas = resultados.filter((r) => r.veredicto === 'NOTA');
  const duplicadas = resultados.filter((r) => r.veredicto === 'DUPLICADA').length;
  const rechazadas = resultados.filter((r) => r.veredicto === 'RECHAZADA').length;
  const aGuardar = nuevasFacturas.length + nuevasNotas.length;

  const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
  const partesGuardar = [
    nuevasFacturas.length > 0 ? plural(nuevasFacturas.length, 'factura', 'facturas') : null,
    nuevasNotas.length > 0 ? plural(nuevasNotas.length, 'nota de crédito', 'notas de crédito') : null,
  ].filter(Boolean);

  const guardar = () => {
    agregarDocumentos({
      facturas: nuevasFacturas.map((r) => r.factura as Omit<Factura, 'id'>),
      notas: nuevasNotas.map((r) => r.nota as Omit<NotaCredito, 'id'>),
    });
    const anuladas = nuevasNotas
      .map((r) => r.nota as Omit<NotaCredito, 'id'>)
      .filter((n) => facturas.some((f) => f.numero === n.facturaModificada))
      .map((n) => n.facturaModificada);
    onGuardado(
      `${partesGuardar.join(' y ')} guardadas.` +
        (anuladas.length > 0 ? ` La factura ${anuladas.join(', ')} se actualizó con su nota de crédito.` : ''),
    );
  };

  return (
    <Modal isOpen onClose={onCerrar} title="Subir facturas y notas de crédito">
      {!revisando ? (
        <div className="space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              setRevisando(true);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-1 focus-within:ring-ring',
              arrastrando ? 'border-primary bg-[#eaf0f8]' : 'border-input hover:bg-muted',
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Arrastra aquí los XML o haz clic para elegirlos
            </span>
            <span className="text-xs text-muted-foreground">
              Puedes subir varios a la vez. Se aceptan facturas y notas de crédito autorizadas por
              el SRI, de producción y emitidas por ESPE STORE.
            </span>
            <input
              type="file"
              accept=".xml"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) setRevisando(true);
              }}
            />
          </label>
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              Maqueta: la revisión es una simulación con los 5 XML reales (4 facturas y 1 nota de
              crédito) y 2 ejemplos de error.
            </span>
            <Boton size="sm" variant="outline" className="shrink-0" onClick={() => setRevisando(true)}>
              Usar archivos de ejemplo
            </Boton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground" role="status">
            {aGuardar === 0
              ? 'No hay documentos nuevos para guardar'
              : `${partesGuardar.join(' y ')} ${aGuardar === 1 ? 'lista' : 'listas'} para guardar`}
            {duplicadas > 0 && `, ${duplicadas} ya registrada${duplicadas === 1 ? '' : 's'}`}
            {rechazadas > 0 && `, ${rechazadas} rechazada${rechazadas === 1 ? '' : 's'}`}.
          </p>

          <ul className="max-h-[52vh] divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {resultados.map((r) => {
              const Icono =
                r.veredicto === 'FACTURA'
                  ? CircleCheck
                  : r.veredicto === 'NOTA'
                    ? FileMinus
                    : r.veredicto === 'DUPLICADA'
                      ? AlertTriangle
                      : CircleX;
              const color =
                r.veredicto === 'FACTURA'
                  ? 'text-[var(--fin-ok-fg)]'
                  : r.veredicto === 'NOTA'
                    ? 'text-[var(--fin-info-fg)]'
                    : r.veredicto === 'DUPLICADA'
                      ? 'text-[var(--fin-aviso-fg)]'
                      : 'text-[var(--fin-error-fg)]';
              return (
                <li key={r.archivo} className="flex items-start gap-3 px-4 py-3">
                  <Icono className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="fin-codigo truncate text-[13px] text-foreground">{r.archivo}</p>
                    <p className="text-xs text-muted-foreground">{r.mensaje}</p>
                    {r.resumen && <p className="mt-1 text-xs text-foreground">{r.resumen}</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Boton variant="outline" onClick={() => setRevisando(false)}>
              Volver
            </Boton>
            <Boton disabled={aGuardar === 0} onClick={guardar}>
              {aGuardar === 0
                ? 'No hay documentos para guardar'
                : `Guardar ${partesGuardar.join(' y ')}`}
            </Boton>
          </div>
        </div>
      )}
    </Modal>
  );
}
