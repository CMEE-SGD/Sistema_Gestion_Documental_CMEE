import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Cobro,
  Egreso,
  EstadoEgreso,
  Factura,
  NotaCredito,
  ValorRevision,
} from './tipos';
import { EGRESOS_DEMO, FACTURAS_DEMO } from './datosDemo';
import { totalesFactura } from './calculos';

// Estado en memoria de la maqueta: al recargar la página o pulsar
// "Restablecer datos" todo vuelve a los datos de demostración.

interface Documentos {
  facturas: Factura[];
  // Notas de crédito cuya factura original todavía no está registrada.
  notasSueltas: NotaCredito[];
}

interface FinancieroDemo {
  facturas: Factura[];
  notasSueltas: NotaCredito[];
  egresos: Egreso[];
  revision: Record<string, ValorRevision>;
  registrarCobro: (facturaId: number, cobro: Omit<Cobro, 'id'>) => void;
  anularFactura: (facturaId: number) => void;
  vincularOrden: (facturaId: number, orden: string | null) => void;
  agregarDocumentos: (nuevos: {
    facturas: Array<Omit<Factura, 'id'>>;
    notas: Array<Omit<NotaCredito, 'id'>>;
  }) => void;
  agregarEgreso: (egreso: Omit<Egreso, 'id'>) => void;
  cambiarEstadoEgreso: (id: number, estado: EstadoEgreso) => void;
  marcarRevision: (clave: string, valor: ValorRevision) => void;
  restablecer: () => void;
}

const Contexto = createContext<FinancieroDemo | null>(null);

const INICIAL: Documentos = { facturas: FACTURAS_DEMO, notasSueltas: [] };

export function FinancieroDemoProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<Documentos>(INICIAL);
  const [egresos, setEgresos] = useState<Egreso[]>(EGRESOS_DEMO);
  const [revision, setRevision] = useState<Record<string, ValorRevision>>({});

  const registrarCobro = useCallback(
    (facturaId: number, cobro: Omit<Cobro, 'id'>) => {
      setDocs((prev) => ({
        ...prev,
        facturas: prev.facturas.map((f) => {
          if (f.id !== facturaId) return f;
          const idCobro = Math.max(0, ...f.cobros.map((c) => c.id)) + 1;
          return { ...f, cobros: [...f.cobros, { ...cobro, id: idCobro }] };
        }),
      }));
    },
    [],
  );

  const anularFactura = useCallback((facturaId: number) => {
    setDocs((prev) => ({
      ...prev,
      facturas: prev.facturas.map((f) =>
        f.id === facturaId && totalesFactura(f).cobrado === 0 && f.cobros.length === 0
          ? { ...f, anulada: true }
          : f,
      ),
    }));
  }, []);

  const vincularOrden = useCallback(
    (facturaId: number, orden: string | null) => {
      setDocs((prev) => ({
        ...prev,
        facturas: prev.facturas.map((f) =>
          f.id === facturaId ? { ...f, ordenTrabajo: orden } : f,
        ),
      }));
    },
    [],
  );

  // Agrega facturas y notas de crédito de una sola vez. Cada nota se aplica a
  // la factura que modifica; si esa factura no está, queda como "suelta" y se
  // aplica sola cuando se cargue.
  const agregarDocumentos = useCallback<FinancieroDemo['agregarDocumentos']>((nuevos) => {
    setDocs((prev) => {
      const facturas = [...prev.facturas];
      const numeros = new Set(facturas.map((f) => f.numero));
      let siguienteFactura = Math.max(0, ...facturas.map((f) => f.id)) + 1;
      for (const n of nuevos.facturas) {
        if (numeros.has(n.numero)) continue;
        numeros.add(n.numero);
        facturas.push({ ...n, id: siguienteFactura++ });
      }

      const notasConocidas = new Set([
        ...facturas.flatMap((f) => f.creditos.map((c) => c.numero)),
        ...prev.notasSueltas.map((n) => n.numero),
      ]);
      let siguienteNota =
        Math.max(
          0,
          ...facturas.flatMap((f) => f.creditos.map((c) => c.id)),
          ...prev.notasSueltas.map((n) => n.id),
        ) + 1;
      const notasNuevas: NotaCredito[] = [];
      for (const n of nuevos.notas) {
        if (notasConocidas.has(n.numero)) continue;
        notasConocidas.add(n.numero);
        notasNuevas.push({ ...n, id: siguienteNota++ });
      }

      const sueltas: NotaCredito[] = [];
      const porNumero = new Map(facturas.map((f, i) => [f.numero, i]));
      for (const nota of [...prev.notasSueltas, ...notasNuevas]) {
        const idx = porNumero.get(nota.facturaModificada);
        if (idx === undefined) {
          sueltas.push(nota);
        } else {
          facturas[idx] = { ...facturas[idx], creditos: [...facturas[idx].creditos, nota] };
        }
      }
      return { facturas, notasSueltas: sueltas };
    });
  }, []);

  const agregarEgreso = useCallback((egreso: Omit<Egreso, 'id'>) => {
    setEgresos((prev) => [
      ...prev,
      { ...egreso, id: Math.max(0, ...prev.map((e) => e.id)) + 1 },
    ]);
  }, []);

  const cambiarEstadoEgreso = useCallback((id: number, estado: EstadoEgreso) => {
    setEgresos((prev) => prev.map((e) => (e.id === id ? { ...e, estado } : e)));
  }, []);

  const marcarRevision = useCallback((clave: string, valor: ValorRevision) => {
    setRevision((prev) => ({ ...prev, [clave]: valor }));
  }, []);

  const restablecer = useCallback(() => {
    setDocs(INICIAL);
    setEgresos(EGRESOS_DEMO);
    setRevision({});
  }, []);

  const valor = useMemo(
    () => ({
      facturas: docs.facturas,
      notasSueltas: docs.notasSueltas,
      egresos,
      revision,
      registrarCobro,
      anularFactura,
      vincularOrden,
      agregarDocumentos,
      agregarEgreso,
      cambiarEstadoEgreso,
      marcarRevision,
      restablecer,
    }),
    [
      docs,
      egresos,
      revision,
      registrarCobro,
      anularFactura,
      vincularOrden,
      agregarDocumentos,
      agregarEgreso,
      cambiarEstadoEgreso,
      marcarRevision,
      restablecer,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFinanciero(): FinancieroDemo {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useFinanciero debe usarse dentro de FinancieroDemoProvider');
  return ctx;
}
