import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import {
  DATOS_VACIOS,
  cargarDatos,
  guardarDatos,
  leerCopia,
  serializarCopia,
} from './almacenamiento';
import { totalesFactura } from './calculos';

// Estado del módulo. Empieza vacío: todo lo que se ve lo cargó quien lo usa.
// Se guarda solo en este navegador después de cada cambio.

interface Documentos {
  facturas: Factura[];
  // Notas de crédito cuya factura original todavía no está registrada.
  notasSueltas: NotaCredito[];
}

interface Financiero {
  facturas: Factura[];
  notasSueltas: NotaCredito[];
  egresos: Egreso[];
  revision: Record<string, ValorRevision>;
  // Devolución de anticipo del acumulado: se escribe a mano.
  devolucion: number;
  // true si no hay ni una factura, nota ni egreso.
  vacio: boolean;
  // true si el navegador no dejó guardar los últimos cambios.
  errorGuardado: boolean;
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
  establecerDevolucion: (monto: number) => void;
  vaciar: () => void;
  exportarCopia: () => string;
  // null si se cargó; si no, el motivo por el que no se pudo.
  importarCopia: (contenido: string) => string | null;
}

const Contexto = createContext<Financiero | null>(null);

export function FinancieroProvider({ children }: { children: ReactNode }) {
  const [inicial] = useState(() => cargarDatos() ?? DATOS_VACIOS);
  const [docs, setDocs] = useState<Documentos>({
    facturas: inicial.facturas,
    notasSueltas: inicial.notasSueltas,
  });
  const [egresos, setEgresos] = useState<Egreso[]>(inicial.egresos);
  const [revision, setRevision] = useState<Record<string, ValorRevision>>(inicial.revision);
  const [devolucion, setDevolucion] = useState(inicial.devolucion);
  const [errorGuardado, setErrorGuardado] = useState(false);

  useEffect(() => {
    setErrorGuardado(
      !guardarDatos({
        facturas: docs.facturas,
        notasSueltas: docs.notasSueltas,
        egresos,
        revision,
        devolucion,
      }),
    );
  }, [docs, egresos, revision, devolucion]);

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

  // Agrega facturas y notas de crédito de una sola vez. Se ignoran las que ya
  // están (misma clave de acceso). Cada nota se aplica a la factura que
  // modifica; si esa factura no está, queda como "suelta" y se aplica sola
  // cuando se cargue.
  const agregarDocumentos = useCallback<Financiero['agregarDocumentos']>((nuevos) => {
    setDocs((prev) => {
      const facturas = [...prev.facturas];
      const claves = new Set(facturas.map((f) => f.claveAcceso));
      let siguienteFactura = Math.max(0, ...facturas.map((f) => f.id)) + 1;
      for (const n of nuevos.facturas) {
        if (claves.has(n.claveAcceso)) continue;
        claves.add(n.claveAcceso);
        facturas.push({ ...n, id: siguienteFactura++ });
      }

      const notasConocidas = new Set([
        ...facturas.flatMap((f) => f.creditos.map((c) => c.claveAcceso)),
        ...prev.notasSueltas.map((n) => n.claveAcceso),
      ]);
      let siguienteNota =
        Math.max(
          0,
          ...facturas.flatMap((f) => f.creditos.map((c) => c.id)),
          ...prev.notasSueltas.map((n) => n.id),
        ) + 1;
      const notasNuevas: NotaCredito[] = [];
      for (const n of nuevos.notas) {
        if (notasConocidas.has(n.claveAcceso)) continue;
        notasConocidas.add(n.claveAcceso);
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

  const establecerDevolucion = useCallback((monto: number) => {
    setDevolucion(Math.max(0, Math.round(monto * 100) / 100));
  }, []);

  const aplicar = useCallback((d: typeof DATOS_VACIOS) => {
    setDocs({ facturas: d.facturas, notasSueltas: d.notasSueltas });
    setEgresos(d.egresos);
    setRevision(d.revision);
    setDevolucion(d.devolucion);
  }, []);

  const vaciar = useCallback(() => aplicar(DATOS_VACIOS), [aplicar]);

  const exportarCopia = useCallback(
    () =>
      serializarCopia({
        facturas: docs.facturas,
        notasSueltas: docs.notasSueltas,
        egresos,
        revision,
        devolucion,
      }),
    [docs, egresos, revision, devolucion],
  );

  const importarCopia = useCallback(
    (contenido: string) => {
      const lectura = leerCopia(contenido);
      if (!lectura.ok) return lectura.mensaje;
      aplicar(lectura.datos);
      return null;
    },
    [aplicar],
  );

  const vacio = docs.facturas.length === 0 && docs.notasSueltas.length === 0 && egresos.length === 0;

  const valor = useMemo(
    () => ({
      facturas: docs.facturas,
      notasSueltas: docs.notasSueltas,
      egresos,
      revision,
      devolucion,
      vacio,
      errorGuardado,
      registrarCobro,
      anularFactura,
      vincularOrden,
      agregarDocumentos,
      agregarEgreso,
      cambiarEstadoEgreso,
      marcarRevision,
      establecerDevolucion,
      vaciar,
      exportarCopia,
      importarCopia,
    }),
    [
      docs,
      egresos,
      revision,
      devolucion,
      vacio,
      errorGuardado,
      registrarCobro,
      anularFactura,
      vincularOrden,
      agregarDocumentos,
      agregarEgreso,
      cambiarEstadoEgreso,
      marcarRevision,
      establecerDevolucion,
      vaciar,
      exportarCopia,
      importarCopia,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFinanciero(): Financiero {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useFinanciero debe usarse dentro de FinancieroProvider');
  return ctx;
}
