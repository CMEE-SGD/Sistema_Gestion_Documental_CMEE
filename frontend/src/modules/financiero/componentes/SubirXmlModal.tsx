import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CircleCheck, CircleX, FileMinus, Upload } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import { vencimientoDe } from '../calculos';
import { fmtFecha, fmtUSD } from '../formato';
import { leerXmlSri, type LecturaXml } from '../lectorXmlSri';
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

interface Leido {
  archivo: string;
  lectura: LecturaXml;
}

export default function SubirXmlModal({
  onCerrar,
  onGuardado,
}: {
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const { facturas, notasSueltas, agregarDocumentos } = useFinanciero();
  const [leidos, setLeidos] = useState<Leido[] | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const leerArchivos = async (lista: File[]) => {
    if (lista.length === 0) return;
    setLeyendo(true);
    const leidosNuevos: Leido[] = [];
    for (const archivo of lista) {
      try {
        leidosNuevos.push({ archivo: archivo.name, lectura: leerXmlSri(await archivo.text()) });
      } catch {
        leidosNuevos.push({
          archivo: archivo.name,
          lectura: { tipo: 'ERROR', mensaje: 'No se pudo abrir el archivo.' },
        });
      }
    }
    setLeidos(leidosNuevos);
    setLeyendo(false);
  };

  const resultados: Resultado[] = useMemo(() => {
    if (!leidos) return [];
    // Facturas que vienen en este mismo lote: una nota puede modificar una de ellas.
    const enLote = leidos.flatMap((l) => (l.lectura.tipo === 'FACTURA' ? [l.lectura.factura] : []));
    const clavesFactura = new Set(facturas.map((f) => f.claveAcceso));
    const clavesNota = new Set([
      ...facturas.flatMap((f) => f.creditos.map((c) => c.claveAcceso)),
      ...notasSueltas.map((n) => n.claveAcceso),
    ]);

    return leidos.map(({ archivo, lectura }): Resultado => {
      if (lectura.tipo === 'ERROR') {
        return { archivo, veredicto: 'RECHAZADA', mensaje: lectura.mensaje };
      }

      if (lectura.tipo === 'FACTURA') {
        const f = lectura.factura;
        if (clavesFactura.has(f.claveAcceso)) {
          return {
            archivo,
            veredicto: 'DUPLICADA',
            mensaje: 'Ya está registrada: la clave de acceso se repite. No se guardará de nuevo.',
          };
        }
        clavesFactura.add(f.claveAcceso);
        return {
          archivo,
          veredicto: 'FACTURA',
          mensaje: `Factura ${f.numero} lista para guardar.`,
          resumen: `${f.clienteNombre}, ${fmtUSD(f.total)}, vence el ${fmtFecha(vencimientoDe({ ...f, id: 0 }))}`,
          factura: f,
        };
      }

      const n = lectura.nota;
      if (clavesNota.has(n.claveAcceso)) {
        return {
          archivo,
          veredicto: 'DUPLICADA',
          mensaje: 'Esta nota de crédito ya está registrada. No se guardará de nuevo.',
        };
      }
      clavesNota.add(n.claveAcceso);
      const destino =
        facturas.find((f) => f.numero === n.facturaModificada) ??
        enLote.find((f) => f.numero === n.facturaModificada);
      const mensaje = !destino
        ? `Nota de crédito. La factura ${n.facturaModificada} no está registrada: la nota se guarda y se aplicará cuando la cargues.`
        : n.valor >= destino.total - 0.005
          ? `Nota de crédito por el total. La factura ${destino.numero} quedará anulada.`
          : `Nota de crédito parcial. Baja el saldo de la factura ${destino.numero}.`;
      return {
        archivo,
        veredicto: 'NOTA',
        mensaje,
        resumen: `${n.clienteNombre}, ${fmtUSD(n.valor)}${n.motivo ? `, motivo: ${n.motivo}` : ''}`,
        nota: n,
      };
    });
  }, [leidos, facturas, notasSueltas]);

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
    const notas = nuevasNotas.map((r) => r.nota as Omit<NotaCredito, 'id'>);
    const numerosDeFacturas = new Set([
      ...facturas.map((f) => f.numero),
      ...nuevasFacturas.map((r) => (r.factura as Omit<Factura, 'id'>).numero),
    ]);
    agregarDocumentos({
      facturas: nuevasFacturas.map((r) => r.factura as Omit<Factura, 'id'>),
      notas,
    });
    const aplicadas = notas.filter((n) => numerosDeFacturas.has(n.facturaModificada));
    onGuardado(
      `${partesGuardar.join(' y ')} guardadas.` +
        (aplicadas.length > 0
          ? ` La factura ${aplicadas.map((n) => n.facturaModificada).join(', ')} se actualizó con su nota de crédito.`
          : ''),
    );
  };

  return (
    <Modal isOpen onClose={onCerrar} title="Subir facturas y notas de crédito">
      {!leidos ? (
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
              void leerArchivos(Array.from(e.dataTransfer.files));
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring',
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
              accept=".xml,text/xml,application/xml"
              multiple
              className="sr-only"
              onChange={(e) => {
                const lista = Array.from(e.target.files ?? []);
                e.target.value = '';
                void leerArchivos(lista);
              }}
            />
          </label>
          {leyendo && (
            <p role="status" className="text-sm text-muted-foreground">
              Leyendo los archivos…
            </p>
          )}
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
            {resultados.map((r, i) => {
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
                <li key={`${r.archivo}-${i}`} className="flex items-start gap-3 px-4 py-3">
                  <Icono className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="fin-codigo truncate text-[13px] text-foreground" title={r.archivo}>
                      {r.archivo}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.mensaje}</p>
                    {r.resumen && <p className="mt-1 text-xs text-foreground">{r.resumen}</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Boton variant="outline" onClick={() => setLeidos(null)}>
              Elegir otros archivos
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
