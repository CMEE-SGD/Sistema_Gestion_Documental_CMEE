// Tarjeta read-only con TODOS los datos del cliente / unidad solicitante.
// Se reutiliza en el detalle de orden (VistaDetalleOrden) y en el detalle
// de equipo (VistaDetalleEquipo). El backend ya incluye estos campos en el
// `cliente` de /recepcion-equipos.

import { Building2, Mail, MapPin, Phone } from 'lucide-react';

export interface ClienteDatos {
  id: number;
  nombre: string;
  ruc: string | null;
  representante: string;
  direccion: string;
  telefono: string;
  email: string | null;
  tipo: string;
  activo: boolean;
}

const TIPO_LABEL: Record<string, string> = {
  MILITAR: 'Institucional Militar',
  CIVIL: 'Civil',
};

function Valor({ value }: { value: string | null | undefined }) {
  return value ? (
    <span className="text-base font-semibold">{value}</span>
  ) : (
    <span className="text-base italic text-muted-foreground/60">—</span>
  );
}

export default function ClienteDatosCard({
  cliente,
}: {
  cliente: ClienteDatos | null;
}) {
  if (!cliente) return null;

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
        <Building2 className="h-4 w-4" />
        Datos del Cliente / Unidad
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        <div>
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
            Nombre
          </span>
          <span className="text-base font-bold text-foreground">
            {cliente.nombre}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
            RUC / NIT
          </span>
          <Valor value={cliente.ruc} />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
            Representante
          </span>
          <Valor value={cliente.representante} />
        </div>
        <div>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <MapPin className="h-3.5 w-3.5" />
            Dirección
          </span>
          <Valor value={cliente.direccion} />
        </div>
        <div>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <Phone className="h-3.5 w-3.5" />
            Teléfono
          </span>
          <Valor value={cliente.telefono} />
        </div>
        <div>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <Mail className="h-3.5 w-3.5" />
            Correo Electrónico
          </span>
          <Valor value={cliente.email} />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
            Tipo
          </span>
          <span className="text-base font-semibold">
            {TIPO_LABEL[cliente.tipo] || cliente.tipo}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
            Estado
          </span>
          <span
            className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
              cliente.activo
                ? 'border-green-300 bg-green-100 text-green-700'
                : 'border-gray-300 bg-gray-100 text-gray-600'
            }`}
          >
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
    </div>
  );
}