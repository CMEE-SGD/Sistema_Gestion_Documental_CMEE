import { useState, type FormEvent } from 'react';
import { cn } from '../../../shared/utils/utils';
import { CATEGORIAS_EGRESO } from '../calculos';
import { MESES, HOY, mesDeIso, anioDeIso } from '../formato';
import type { CategoriaEgreso, Egreso, EstadoEgreso } from '../tipos';
import { Aviso, Boton, Modal, inputCls, labelCls } from '../ui';

export default function EgresoModal({
  onCerrar,
  onGuardar,
}: {
  onCerrar: () => void;
  onGuardar: (egreso: Omit<Egreso, 'id'>) => void;
}) {
  const [mes, setMes] = useState(mesDeIso(HOY));
  const [categoria, setCategoria] = useState<CategoriaEgreso>('ADQUISICIONES');
  const [detalle, setDetalle] = useState('');
  const [estado, setEstado] = useState<EstadoEgreso>('PAGADO');
  const [monto, setMonto] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const valor = Number(monto);
    if (!detalle.trim()) {
      setError('Describe el gasto en el campo Detalle.');
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }
    onGuardar({
      anio: anioDeIso(HOY),
      mes,
      categoria,
      detalle: detalle.trim(),
      estado,
      monto: Math.round(valor * 100) / 100,
      observacion: observacion.trim() || undefined,
    });
  };

  return (
    <Modal isOpen onClose={onCerrar} title="Nuevo egreso">
      <form onSubmit={guardar} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="egreso-categoria" className={labelCls}>
              Categoría
            </label>
            <select
              id="egreso-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaEgreso)}
              className={inputCls}
            >
              {(Object.keys(CATEGORIAS_EGRESO) as CategoriaEgreso[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORIAS_EGRESO[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="egreso-mes" className={labelCls}>
              Mes de 2026
            </label>
            <select
              id="egreso-mes"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className={inputCls}
            >
              {MESES.slice(0, mesDeIso(HOY)).map((nombre, i) => (
                <option key={nombre} value={i + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="egreso-detalle" className={labelCls}>
            Detalle
          </label>
          <input
            id="egreso-detalle"
            type="text"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Ej. Honorarios técnico de calibración"
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="egreso-monto" className={labelCls}>
              Monto
            </label>
            <input
              id="egreso-monto"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className={cn(inputCls, 'fin-cifra')}
            />
          </div>
          <fieldset>
            <legend className={labelCls}>Estado</legend>
            <div className="flex gap-2" role="radiogroup">
              {(
                [
                  ['PAGADO', 'Pagado'],
                  ['PENDIENTE', 'Pendiente'],
                ] as Array<[EstadoEgreso, string]>
              ).map(([valor, texto]) => (
                <label
                  key={valor}
                  className={cn(
                    'flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors focus-within:ring-1 focus-within:ring-ring',
                    estado === valor
                      ? 'border-primary bg-[#eaf0f8] text-primary ring-1 ring-primary/30'
                      : 'border-input text-foreground hover:bg-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="estado-egreso"
                    value={valor}
                    checked={estado === valor}
                    onChange={() => setEstado(valor)}
                    className="sr-only"
                  />
                  {texto}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="egreso-obs" className={labelCls}>
            Observación (opcional)
          </label>
          <textarea
            id="egreso-obs"
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && <Aviso tono="error">{error}</Aviso>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Boton type="button" variant="outline" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit">Guardar egreso</Boton>
        </div>
      </form>
    </Modal>
  );
}
