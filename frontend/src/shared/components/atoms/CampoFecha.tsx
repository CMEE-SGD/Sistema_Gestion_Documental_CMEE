import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { CalendarDays } from 'lucide-react';

// Campo de fecha que se escribe y se muestra como AÑO-MES-DÍA (2026-11-13).
//
// El <input type="date"> nativo ordena la fecha según el idioma del navegador
// y no se puede cambiar desde la página, por eso este campo usa un texto con
// máscara y, al lado, el botón del calendario nativo para elegir con el ratón.
// El valor que entrega es el mismo que el del campo nativo: "AAAA-MM-DD" o "".

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'defaultValue'
> & {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const COMPLETA = /^(\d{4})-(\d{2})-(\d{2})$/;

function esFechaReal(texto: string): boolean {
  const m = COMPLETA.exec(texto);
  if (!m) return false;
  const [, a, me, d] = m;
  const f = new Date(Date.UTC(Number(a), Number(me) - 1, Number(d)));
  return (
    f.getUTCFullYear() === Number(a) &&
    f.getUTCMonth() === Number(me) - 1 &&
    f.getUTCDate() === Number(d)
  );
}

/** Deja solo dígitos y pone los guiones: 20261113 → 2026-11-13. */
function aplicarMascara(crudo: string): string {
  const d = crudo.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

export default function CampoFecha({
  value,
  onChange,
  name,
  id,
  min,
  max,
  disabled,
  readOnly,
  required,
  className = '',
  ...resto
}: Props) {
  const [texto, setTexto] = useState(value || '');
  const selectorRef = useRef<HTMLInputElement>(null);

  // Si el valor cambia desde afuera (por ejemplo, se limpia el formulario).
  useEffect(() => {
    setTexto(value || '');
  }, [value]);

  const emitir = (nuevo: string) => {
    onChange({
      target: { name, id, value: nuevo },
      currentTarget: { name, id, value: nuevo },
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  const dentroDelRango = (v: string) =>
    (!min || v >= String(min)) && (!max || v <= String(max));

  const alEscribir = (e: ChangeEvent<HTMLInputElement>) => {
    const nuevo = aplicarMascara(e.target.value);
    setTexto(nuevo);
    if (nuevo === '') {
      emitir('');
    } else if (esFechaReal(nuevo) && dentroDelRango(nuevo)) {
      emitir(nuevo);
    }
  };

  // Al salir del campo, si lo escrito no es una fecha válida, vuelve al último valor bueno.
  const alSalir = () => {
    if (texto !== '' && !(esFechaReal(texto) && dentroDelRango(texto))) {
      setTexto(value || '');
    }
  };

  const abrirCalendario = () => {
    const el = selectorRef.current;
    if (!el || disabled || readOnly) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click();
    }
  };

  return (
    <span
      className={`${className} focus-within:border-blue-500`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative' }}
    >
      <input
        {...resto}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="AAAA-MM-DD"
        maxLength={10}
        value={texto}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onChange={alEscribir}
        onBlur={alSalir}
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          background: 'transparent',
          border: 0,
          outline: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
        }}
      />
      <button
        type="button"
        onClick={abrirCalendario}
        disabled={disabled || readOnly}
        title="Elegir en el calendario"
        aria-label="Elegir fecha en el calendario"
        style={{ display: 'inline-flex', color: 'inherit', opacity: 0.65 }}
      >
        <CalendarDays size={16} />
      </button>
      {/* Calendario nativo, oculto: solo se usa para elegir con el ratón. */}
      <input
        ref={selectorRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={esFechaReal(texto) ? texto : ''}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          setTexto(e.target.value);
          emitir(e.target.value);
        }}
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}
