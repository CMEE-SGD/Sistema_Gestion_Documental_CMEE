import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import type { ValorRevision } from '../tipos';
import { EncabezadoPagina, Panel, colorTexto } from '../ui';

interface Regla {
  clave: string;
  titulo: string;
  detalle: string;
}

const GRUPOS: Array<{ titulo: string; reglas: Regla[] }> = [
  {
    titulo: 'Facturas y cobros',
    reglas: [
      {
        clave: 'estado',
        titulo: 'El estado de una factura se calcula solo',
        detalle:
          'Pendiente si no hay cobros. Pago parcial si hay cobros y queda saldo. Cobrada cuando el saldo llega a cero. Vencida cuando pasó la fecha de vencimiento y aún hay saldo. Anulada es una decisión manual.',
      },
      {
        clave: 'retencion',
        titulo: 'Las retenciones cuentan como cobro',
        detalle:
          'Una retención descuenta saldo igual que un pago. Una factura de $171.32 que se paga con $160.00 y una retención de $11.32 queda cobrada.',
      },
      {
        clave: 'plazo',
        titulo: 'El plazo de crédito sale del XML',
        detalle:
          'Las facturas vistas hasta ahora traen 30 días. El vencimiento es la fecha de emisión más ese plazo.',
      },
      {
        clave: 'orden',
        titulo: 'Una factura pertenece a una sola orden de trabajo',
        detalle:
          'El XML no trae el número de orden, así que se escribe a mano. Vincularla es opcional.',
      },
      {
        clave: 'equipos',
        titulo: 'La entrega de equipos cuenta como un cobro',
        detalle:
          'Se registra el valor acordado de los equipos como un cobro de tipo entrega de equipos, con su observación.',
      },
      {
        clave: 'anular',
        titulo: 'Una factura con cobros no se puede anular a mano',
        detalle: 'Las facturas nunca se eliminan. A mano solo se anulan las que no tienen cobros registrados.',
      },
    ],
  },
  {
    titulo: 'Notas de crédito',
    reglas: [
      {
        clave: 'nc_anula',
        titulo: 'Una nota de crédito por el total anula la factura que modifica',
        detalle:
          'La nota trae el número de la factura que corrige y se enlaza sola. Si su valor cubre el total, la factura queda Anulada por nota de crédito; si es menor, solo baja su saldo.',
      },
      {
        clave: 'nc_mes',
        titulo: 'La nota de crédito resta en el mes en que se emite',
        detalle:
          'La factura anulada sigue contando en su mes original y la nota resta en el suyo. Ejemplo: la factura 168 es de junio y su nota es de septiembre, así que septiembre baja $148.97.',
      },
      {
        clave: 'nc_suelta',
        titulo: 'Una nota sin su factura cargada se guarda igual',
        detalle:
          'Se avisa que falta la factura original y la nota se aplica sola cuando esa factura se cargue.',
      },
      {
        clave: 'refactura',
        titulo: 'Una refacturación se muestra como posible reemplazo',
        detalle:
          'Una factura del mismo cliente, con el mismo valor y emitida el día de la nota se marca como posible reemplazo de la factura anulada. Así se relacionan la 168 y la 263. Solo se sugiere, no se unen.',
      },
    ],
  },
  {
    titulo: 'Subida de facturas y notas de crédito',
    reglas: [
      {
        clave: 'xml',
        titulo: 'Solo se aceptan XML autorizados, de producción y de ESPE STORE',
        detalle:
          'Se reconocen facturas y notas de crédito. Un XML no autorizado por el SRI, de pruebas o de otro emisor se rechaza con el motivo.',
      },
      {
        clave: 'duplicada',
        titulo: 'La clave de acceso evita duplicados',
        detalle: 'Si la clave de acceso ya está registrada, el archivo se marca como "ya registrada" y no se guarda.',
      },
      {
        clave: 'cliente',
        titulo: 'El cliente sale del XML',
        detalle:
          'Se toman la razón social y el RUC del comprobante. Enlazarlo con el módulo Clientes queda para cuando exista el servidor.',
      },
    ],
  },
  {
    titulo: 'Egresos y disponible',
    reglas: [
      {
        clave: 'neto',
        titulo: 'El ingreso neto es la suma de bases sin IVA menos las notas de crédito',
        detalle:
          'Suma la base de las facturas y resta la base de las notas de crédito, cada una en el mes de su emisión.',
      },
      {
        clave: 'reparto',
        titulo: 'El ingreso neto se reparte 85% CMEE y 15% ESPE',
        detalle: 'Es la regla que muestra el Excel actual. Aquí es un valor fijo.',
      },
      {
        clave: 'acumulado',
        titulo: 'El disponible es acumulado desde el inicio del proyecto',
        detalle:
          'Así lo calcula el Excel. La vista "Este mes" muestra el mismo cálculo solo con los movimientos del mes.',
      },
      {
        clave: 'pendientes',
        titulo: 'Los egresos por pagar también restan',
        detalle: 'El disponible descuenta los egresos pagados y los que están en proceso de pago.',
      },
      {
        clave: 'provision',
        titulo: 'La provisión es el 10% del disponible',
        detalle:
          'Se calcula sobre el disponible después de sumar la devolución de anticipo, que se registra a mano.',
      },
      {
        clave: 'mes_parcial',
        titulo: '"Este mes" se compara con el mismo tramo del mes anterior',
        detalle:
          'Si hoy es 25, septiembre del 1 al 25 se compara con agosto del 1 al 25, no con agosto completo. Así una variación negativa a mitad de mes no parece una caída real.',
      },
    ],
  },
];

const OPCIONES: Array<{ valor: ValorRevision; etiqueta: string; activo: string }> = [
  { valor: 'CORRECTO', etiqueta: 'Correcto', activo: 'bg-[var(--fin-ok-fg)] text-white' },
  { valor: 'CORREGIR', etiqueta: 'Corregir', activo: 'bg-[var(--fin-error-fg)] text-white' },
  { valor: 'NO_SE', etiqueta: 'No sé', activo: 'bg-[var(--fin-neutro-fg)] text-white' },
];

export default function ReglasPage() {
  const { revision, marcarRevision } = useFinanciero();
  const todas = GRUPOS.flatMap((g) => g.reglas);
  const cuenta = (v: ValorRevision) => todas.filter((r) => revision[r.clave] === v).length;
  const sinRevisar = todas.length - cuenta('CORRECTO') - cuenta('CORREGIR') - cuenta('NO_SE');

  return (
    <div className="space-y-8">
      <EncabezadoPagina
        titulo="Reglas y supuestos"
        descripcion="Lo que esta maqueta da por cierto. Revisa cada regla con la administradora y márcala."
      />

      <p role="status" className="text-sm text-muted-foreground">
        <span className={cn('font-semibold', colorTexto.ok)}>{cuenta('CORRECTO')} correctas</span>,{' '}
        <span className={cn('font-semibold', colorTexto.error)}>{cuenta('CORREGIR')} por corregir</span>,{' '}
        <span className={cn('font-semibold', colorTexto.neutro)}>{cuenta('NO_SE')} sin saber</span> y{' '}
        <span className="font-semibold text-foreground">{sinRevisar} sin revisar</span>. Las marcas se
        guardan en este navegador.
      </p>

      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo} aria-labelledby={`grupo-${grupo.titulo}`}>
          <h2
            id={`grupo-${grupo.titulo}`}
            className="fin-display mb-3 text-[1.6rem] font-bold leading-none text-foreground"
          >
            {grupo.titulo}
          </h2>
          <Panel sinRelleno>
            <ul className="divide-y divide-border">
              {grupo.reglas.map((r) => (
                <li
                  key={r.clave}
                  className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-foreground">{r.titulo}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{r.detalle}</p>
                  </div>
                  {/* Un solo control por regla: tres opciones que comparten borde. */}
                  <div
                    className="inline-flex shrink-0 divide-x divide-input self-start overflow-hidden rounded-lg border border-input bg-card md:self-center"
                    role="group"
                    aria-label={`Revisión: ${r.titulo}`}
                  >
                    {OPCIONES.map((o) => (
                      <button
                        key={o.valor}
                        type="button"
                        aria-pressed={revision[r.clave] === o.valor}
                        onClick={() => marcarRevision(r.clave, o.valor)}
                        className={cn(
                          'px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                          revision[r.clave] === o.valor ? o.activo : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {o.etiqueta}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      ))}

      <section className="rounded-xl border border-dashed border-input px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Fuera de esta maqueta</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Notas de crédito sobre facturas ya cobradas (devoluciones), XML de retención de los
          clientes, alertas de próxima calibración, guardar los archivos XML y PDF de cada
          factura, importación del Excel actual, consulta directa al SRI y compartir los datos
          entre varios equipos.
        </p>
      </section>
    </div>
  );
}
