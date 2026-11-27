import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import 'leaflet/dist/leaflet.css';
import api from '../../../core/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Hourglass,
  Layers,
  Loader2,
  X,
} from 'lucide-react';
import provinciasGeoJson from '../data/provincias-ecuador.json';
import { PROVINCIAS_ECUADOR } from '../../../shared/data/provincias';

// ---------------------------------------------------------------------------
// Un solo mapa con un punto por equipo, dentro de la provincia de su cliente,
// coloreado según su estado. Cada equipo tiene UN estado, con prioridad:
// próximo a vencer (rojo) > por calibrar (amarillo) > calibrado (verde).
// ---------------------------------------------------------------------------

type Estado = 'PROXIMO' | 'POR_CALIBRAR' | 'CALIBRADO';

interface PuntoEquipo {
  id: number;
  provincia: string;
  clienteId: number;
  cliente: string;
  descripcion: string;
  estado: Estado;
}

interface EmpresaMapa {
  id: number;
  nombre: string;
  ciudad: string | null;
  calibrados: number;
  porCalibrar: number;
  proximos: number;
}

interface FilaProvincia {
  provincia: string;
  calibrados: number;
  porCalibrar: number;
  proximos: number;
  clientes: number;
  empresas: EmpresaMapa[];
}

interface MapaCalorResponse {
  dias: number;
  sinProvincia: number;
  puntos: PuntoEquipo[];
  provincias: FilaProvincia[];
}

// Colores tomados de la matriz de riesgo del CMEE.
// `color` es el del punto; `fuerte` el de texto/iconos sobre fondo claro.
const ESTADOS: {
  id: Estado;
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  fuerte: string;
}[] = [
  { id: 'CALIBRADO', label: 'Calibrados', icon: CheckCircle2, color: '#2f8a5c', fuerte: '#1f7a4d' },
  { id: 'POR_CALIBRAR', label: 'Por calibrar', icon: Hourglass, color: '#f5b400', fuerte: '#a16207' },
  { id: 'PROXIMO', label: 'Tentativa de próxima calibración', icon: CalendarClock, color: '#d62839', fuerte: '#b91c3c' },
];
const INFO = Object.fromEntries(ESTADOS.map((e) => [e.id, e])) as Record<Estado, (typeof ESTADOS)[number]>;

const DIAS_OPCIONES = [30, 60, 90, 180];

const COLOR_PROVINCIA = '#f1f5f9';
const COLOR_CONTORNO = '#6b7280';
const COLOR_SELECCION = '#0f172a';

// Mapa base: teselas estándar de OpenStreetMap (sin API key). Si la red
// institucional las bloquea, el mapa sigue funcionando sobre el fondo liso.
const MAPA_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const geo = provinciasGeoJson as FeatureCollection;

// El GeoJSON trae "Sucumbios"/"Manabi" sin tilde; el catálogo del backend sí
// la lleva. Se compara sin acentos y en minúsculas.
const clave = (nombre: string) =>
  nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const NOMBRES = new Map<string, string>(PROVINCIAS_ECUADOR.map((p) => [clave(p), p]));

// Los nombres de prueba llevan prefijo "[DEMO]"; solo se oculta en pantalla.
const nombreEmpresa = (nombre: string) => nombre.replace(/^\[DEMO\](?: MAP)?\s*/, '');

// Las fechas llegan como DATE (medianoche UTC): se formatean en UTC para que no
// se corran un día por la zona horaria del navegador.
const fmtFecha = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('es-EC', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

function ClicFuera({ alt }: { alt: () => void }) {
  useMapEvents({ click: alt });
  return null;
}

// ---------------------------------------------------------------------------
// Ubicación de los puntos dentro de cada provincia
// ---------------------------------------------------------------------------

// Generador pseudoaleatorio con semilla: el mismo equipo cae siempre en el
// mismo lugar (los puntos no "saltan" al recargar).
function aleatorio(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function dentroDeAnillo(x: number, y: number, anillo: Position[]) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function dentroDePoligono(x: number, y: number, poligono: Position[][]) {
  if (!dentroDeAnillo(x, y, poligono[0])) return false;
  // Los anillos siguientes son huecos.
  return !poligono.slice(1).some((hueco) => dentroDeAnillo(x, y, hueco));
}

interface FormaProvincia {
  poligonos: Position[][][];
  // Se reparte en el polígono más grande (en Galápagos, la isla más grande),
  // para que los puntos no caigan en islotes diminutos.
  principal: Position[][];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function formaDe(feature: Feature): FormaProvincia | null {
  const g = feature.geometry as Polygon | MultiPolygon | null;
  if (!g) return null;
  const poligonos = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  if (poligonos.length === 0) return null;
  const extension = (p: Position[][]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of p[0]) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    return { minX, minY, maxX, maxY, area: (maxX - minX) * (maxY - minY) };
  };
  let principal = poligonos[0];
  let ext = extension(principal);
  for (const p of poligonos.slice(1)) {
    const e = extension(p);
    if (e.area > ext.area) { principal = p; ext = e; }
  }
  return { poligonos, principal, minX: ext.minX, minY: ext.minY, maxX: ext.maxX, maxY: ext.maxY };
}

/** Posición [lat, lng] estable de un equipo dentro de su provincia. */
function posicionEn(forma: FormaProvincia, semilla: number): [number, number] {
  const rnd = aleatorio(semilla * 2654435761);
  // Un pequeño margen hacia adentro para que no queden sobre el borde.
  const mx = (forma.maxX - forma.minX) * 0.06;
  const my = (forma.maxY - forma.minY) * 0.06;
  for (let i = 0; i < 400; i++) {
    const x = forma.minX + mx + rnd() * (forma.maxX - forma.minX - 2 * mx);
    const y = forma.minY + my + rnd() * (forma.maxY - forma.minY - 2 * my);
    if (dentroDePoligono(x, y, forma.principal)) return [y, x];
  }
  // Provincia muy irregular: se usa el centro de su recuadro.
  return [(forma.minY + forma.maxY) / 2, (forma.minX + forma.maxX) / 2];
}

// ---------------------------------------------------------------------------
// Equipos de una empresa (panel lateral)
// ---------------------------------------------------------------------------

interface EquipoEmpresa {
  id: number;
  descripcion: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  codigoCmee: string | null;
  laboratorio: string;
  orden: string;
  fechaCalibracion: string | null;
  fechaProximaCalibracion: string | null;
  calibrado: boolean;
  proximo: boolean;
  vencido: boolean;
}

interface DetalleEmpresaResponse {
  equipos: EquipoEmpresa[];
}

const estadoDeEquipo = (e: EquipoEmpresa): Estado =>
  e.proximo ? 'PROXIMO' : e.calibrado ? 'CALIBRADO' : 'POR_CALIBRAR';

function EquiposEmpresa({
  empresaId,
  dias,
  visibles,
}: {
  empresaId: number;
  dias: number;
  visibles: Record<Estado, boolean>;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-mapa-calor-empresa', empresaId, dias],
    queryFn: async () => {
      const res = await api.get<DetalleEmpresaResponse>(
        `/dashboard/mapa-calor/empresa/${empresaId}?dias=${dias}`,
      );
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Cargando equipos…
      </div>
    );
  }
  if (isError || !data) {
    return <p className="px-3 py-3 text-xs text-destructive">No se pudieron cargar los equipos.</p>;
  }

  const equipos = data.equipos.filter((e) => visibles[estadoDeEquipo(e)]);

  return (
    <div className="mb-2 ml-6 mr-1 mt-1 space-y-1.5 border-l-2 border-border pl-3">
      {equipos.length === 0 && (
        <p className="py-1 text-xs text-muted-foreground">Sin equipos en los estados marcados.</p>
      )}
      {equipos.map((e) => {
        const info = INFO[estadoDeEquipo(e)];
        const detalle = [e.marca, e.modelo].filter(Boolean).join(' ');
        return (
          <div key={e.id} className="rounded-md border border-border bg-background px-2.5 py-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-tight">{e.descripcion}</span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: `${info.color}26`, color: info.fuerte }}
              >
                {e.proximo ? 'Vence pronto' : e.calibrado ? 'Calibrado' : 'Por calibrar'}
              </span>
            </div>
            <div className="mt-0.5 text-muted-foreground">
              {detalle && `${detalle} · `}
              Serie {e.serie ?? '—'}
              {e.codigoCmee ? ` · ${e.codigoCmee}` : ''}
            </div>
            <div className="text-muted-foreground">
              {e.laboratorio} · Orden {e.orden}
            </div>
            <dl className="mt-1.5 grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Calibración</dt>
                <dd className="font-medium">{fmtFecha(e.fechaCalibracion) ?? 'Sin registrar'}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Próxima</dt>
                <dd
                  className="font-medium"
                  style={e.vencido ? { color: '#b91c3c' } : e.proximo ? { color: '#a16207' } : undefined}
                >
                  {fmtFecha(e.fechaProximaCalibracion) ?? 'Sin registrar'}
                  {e.vencido && ' · vencida'}
                  {e.proximo && ' · pronto'}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

type Conteo = Record<Estado, number>;
const conteoVacio = (): Conteo => ({ CALIBRADO: 0, POR_CALIBRAR: 0, PROXIMO: 0 });

export default function DashboardMapa() {
  const [dias, setDias] = useState(60);
  const [mapaBase, setMapaBase] = useState(true);
  const [visibles, setVisibles] = useState<Record<Estado, boolean>>({
    CALIBRADO: true,
    POR_CALIBRAR: true,
    PROXIMO: true,
  });
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [empresaAbierta, setEmpresaAbierta] = useState<number | null>(null);
  const [mapa, setMapa] = useState<L.Map | null>(null);
  const geoRef = useRef<L.GeoJSON | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-mapa-calor', dias],
    queryFn: async () => {
      const res = await api.get<MapaCalorResponse>(`/dashboard/mapa-calor?dias=${dias}`);
      return res.data;
    },
  });

  const porClave = useMemo(() => {
    const m = new Map<string, FilaProvincia>();
    data?.provincias.forEach((p) => m.set(clave(p.provincia), p));
    return m;
  }, [data]);

  // Conteo por estado (exclusivo: cada equipo en un solo estado), total y por provincia.
  const { totales, porProvincia } = useMemo(() => {
    const totales = conteoVacio();
    const porProvincia = new Map<string, Conteo>();
    for (const p of data?.puntos ?? []) {
      const k = clave(p.provincia);
      if (!porProvincia.has(k)) porProvincia.set(k, conteoVacio());
      porProvincia.get(k)![p.estado]++;
      totales[p.estado]++;
    }
    return { totales, porProvincia };
  }, [data]);

  const formas = useMemo(() => {
    const m = new Map<string, FormaProvincia>();
    for (const f of geo.features) {
      const forma = formaDe(f);
      if (forma) m.set(clave(f.properties?.nombre ?? ''), forma);
    }
    return m;
  }, []);

  // Posición estable de cada punto. Primero los verdes, al final los rojos,
  // para que los urgentes queden dibujados encima.
  const puntosUbicados = useMemo(() => {
    const orden: Record<Estado, number> = { CALIBRADO: 0, POR_CALIBRAR: 1, PROXIMO: 2 };
    return (data?.puntos ?? [])
      .map((p) => {
        const forma = formas.get(clave(p.provincia));
        return forma ? { ...p, pos: posicionEn(forma, p.id) } : null;
      })
      .filter((p): p is PuntoEquipo & { pos: [number, number] } => p !== null)
      .sort((a, b) => orden[a.estado] - orden[b.estado]);
  }, [data, formas]);

  const visiblesEnMapa = puntosUbicados.filter((p) => visibles[p.estado]);

  const sumaVisible = (c: Conteo | undefined) =>
    c ? ESTADOS.reduce((acc, e) => acc + (visibles[e.id] ? c[e.id] : 0), 0) : 0;

  const ranking = useMemo(
    () =>
      [...porProvincia.entries()]
        .map(([k, c]) => ({ k, c, total: sumaVisible(c) }))
        .filter((r) => r.total > 0)
        .sort((a, b) => b.total - a.total),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [porProvincia, visibles],
  );
  const maxRanking = ranking[0]?.total ?? 0;

  // Vista inicial sobre el continente; Galápagos queda accesible con el arrastre.
  const boundsInicial = useMemo(() => {
    const continente = geo.features.filter(
      (f) => clave(f.properties?.nombre ?? '') !== 'galapagos',
    );
    const coleccion: FeatureCollection = { type: 'FeatureCollection', features: continente };
    return L.geoJSON(coleccion).getBounds();
  }, []);

  const estiloDe = useCallback(
    (k: string): L.PathOptions => {
      const esSel = k === seleccionada;
      return {
        fillColor: COLOR_PROVINCIA,
        fillOpacity: mapaBase ? (esSel ? 0.35 : 0.15) : 0.9,
        color: esSel ? COLOR_SELECCION : COLOR_CONTORNO,
        weight: esSel ? 3 : 1,
        opacity: 1,
      };
    },
    [mapaBase, seleccionada],
  );

  const textoTooltip = useCallback(
    (k: string, nombreGeo: string) => {
      const nombre = NOMBRES.get(k) ?? nombreGeo;
      const c = porProvincia.get(k) ?? conteoVacio();
      const filas = ESTADOS.map(
        (e) =>
          `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${e.color};margin-right:6px"></span>${e.label}: <b>${c[e.id]}</b>`,
      ).join('<br/>');
      return `<strong>${nombre}</strong><br/>${filas}`;
    },
    [porProvincia],
  );

  const estiloRef = useRef(estiloDe);
  estiloRef.current = estiloDe;
  const seleccionRef = useRef(seleccionada);
  seleccionRef.current = seleccionada;

  useEffect(() => {
    geoRef.current?.eachLayer((l) => {
      const capa = l as L.Path & { feature?: Feature };
      const nombreGeo: string = capa.feature?.properties?.nombre ?? '';
      const k = clave(nombreGeo);
      capa.setStyle(estiloDe(k));
      capa.setTooltipContent(textoTooltip(k, nombreGeo));
    });
  }, [estiloDe, textoTooltip, seleccionada, data]);

  // Al elegir una provincia el mapa se acerca a ella; al soltarla vuelve al país.
  useEffect(() => {
    if (!mapa) return;
    if (!seleccionada) {
      mapa.flyToBounds(boundsInicial, { padding: [24, 24], duration: 0.6 });
      return;
    }
    geoRef.current?.eachLayer((l) => {
      const capa = l as L.Polygon & { feature?: Feature };
      if (clave(capa.feature?.properties?.nombre ?? '') === seleccionada) {
        mapa.flyToBounds(capa.getBounds(), { padding: [70, 70], maxZoom: 8, duration: 0.6 });
      }
    });
  }, [seleccionada, mapa, boundsInicial]);

  const alCadaProvincia = (feature: Feature, layer: L.Layer) => {
    const nombreGeo: string = feature.properties?.nombre ?? '';
    const k = clave(nombreGeo);
    const capa = layer as L.Path;
    capa.bindTooltip(textoTooltip(k, nombreGeo), { sticky: true });
    capa.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setSeleccionada((actual) => (actual === k ? null : k));
      },
      mouseover: () => {
        if (seleccionRef.current === k) return;
        capa.setStyle({ weight: 2.5, color: COLOR_SELECCION });
      },
      mouseout: () => capa.setStyle(estiloRef.current(k)),
    });
  };

  const detalle = seleccionada ? porClave.get(seleccionada) : undefined;
  const conteoSel = seleccionada ? porProvincia.get(seleccionada) : undefined;
  // Empresas de la provincia elegida con equipos en los estados marcados.
  const empresasSel = useMemo(() => {
    const exclusivos = (e: EmpresaMapa): Conteo => ({
      PROXIMO: e.proximos,
      CALIBRADO: Math.max(0, e.calibrados - e.proximos),
      POR_CALIBRAR: e.porCalibrar,
    });
    return [...(detalle?.empresas ?? [])]
      .map((e) => ({ ...e, c: exclusivos(e) }))
      .map((e) => ({ ...e, total: sumaVisible(e.c) }))
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalle, visibles]);

  const alternar = (id: Estado) => setVisibles((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div className="space-y-6 p-6">
      <style>{`
        .leaflet-container path.leaflet-interactive:focus { outline: none; }
        .leaflet-container { font-family: inherit; }
      `}</style>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mapa de calor</h1>
        <p className="text-sm text-muted-foreground">
          Cada punto es un equipo, ubicado en la provincia de su cliente y coloreado según su estado.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          Próxima calibración en los próximos
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {DIAS_OPCIONES.map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </select>
        </label>

        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          Mapa base
          <input
            type="checkbox"
            checked={mapaBase}
            onChange={(e) => setMapaBase(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </label>
      </div>

      {data && data.sinProvincia > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {data.sinProvincia} equipo{data.sinProvincia === 1 ? '' : 's'} pertenece
            {data.sinProvincia === 1 ? '' : 'n'} a clientes sin provincia y no aparece
            {data.sinProvincia === 1 ? '' : 'n'} en el mapa. Complétala desde Administrativo →
            Clientes.
          </span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando mapa…
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudo cargar el mapa.
        </div>
      )}

      {data && (
        <>
          {/* Un indicador por estado; al hacer clic se muestra u oculta en el mapa. */}
          <div className="grid gap-4 sm:grid-cols-3">
            {ESTADOS.map(({ id, label, icon: Icon, color, fuerte }) => {
              const activo = visibles[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => alternar(id)}
                  aria-pressed={activo}
                  title={activo ? 'Ocultar en el mapa' : 'Mostrar en el mapa'}
                  className={`text-left transition-opacity ${activo ? '' : 'opacity-45'}`}
                >
                  <Card className="h-full" style={activo ? { borderColor: color } : undefined}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="rounded-lg p-2" style={{ background: `${color}26`, color: fuerte }}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-2xl font-bold tabular-nums">{totales[id]}</div>
                        <div className="text-xs text-muted-foreground">
                          {label}
                          {id === 'PROXIMO' ? ` (${dias} días)` : ''}
                        </div>
                      </div>
                      <span
                        className="ml-auto h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white shadow"
                        style={{ background: color }}
                      />
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="overflow-hidden lg:col-span-2">
              <CardContent className="p-0">
                <MapContainer
                  ref={setMapa}
                  bounds={boundsInicial}
                  boundsOptions={{ padding: [24, 24] }}
                  maxBounds={boundsInicial.pad(1.5)}
                  maxBoundsViscosity={0.8}
                  minZoom={5}
                  zoomSnap={0.25}
                  scrollWheelZoom={false}
                  attributionControl={false}
                  className="h-[600px] w-full bg-sky-100 dark:bg-slate-800"
                >
                  {mapaBase && <TileLayer url={MAPA_BASE_URL} maxZoom={19} />}
                  <GeoJSON
                    ref={geoRef}
                    data={geo}
                    style={(f) => estiloDe(clave(f?.properties?.nombre ?? ''))}
                    onEachFeature={alCadaProvincia}
                  />
                  {visiblesEnMapa.map((p) => {
                    const info = INFO[p.estado];
                    return (
                      <CircleMarker
                        key={p.id}
                        center={p.pos}
                        radius={5}
                        pathOptions={{
                          color: '#ffffff',
                          weight: 1.2,
                          fillColor: info.color,
                          fillOpacity: 0.95,
                        }}
                        eventHandlers={{
                          click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            setSeleccionada(clave(p.provincia));
                            setEmpresaAbierta(p.clienteId);
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -4]}>
                          <strong>{p.descripcion}</strong>
                          <br />
                          {nombreEmpresa(p.cliente)}
                          <br />
                          <span style={{ color: info.fuerte, fontWeight: 600 }}>
                            {p.estado === 'PROXIMO' ? 'Vence pronto' : info.label.replace(/s$/, '')}
                          </span>
                        </Tooltip>
                      </CircleMarker>
                    );
                  })}
                  <ClicFuera alt={() => setSeleccionada(null)} />
                </MapContainer>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  {ESTADOS.map(({ id, label, color }) => (
                    <label key={id} className="inline-flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={visibles[id]}
                        onChange={() => alternar(id)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                      {label}
                    </label>
                  ))}
                  <span className="basis-full text-[11px]">
                    Un equipo calibrado cuya próxima calibración vence en los próximos {dias} días se
                    muestra en rojo. La posición del punto dentro de la provincia es referencial.
                  </span>
                  <span className="text-[11px]">
                    Límites: geoBoundaries (CC0){mapaBase ? ' · Mapa: © colaboradores de OpenStreetMap' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {seleccionada && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">
                      {NOMBRES.get(seleccionada) ?? seleccionada}
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setSeleccionada(null)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label="Quitar selección"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    {detalle && conteoSel ? (
                      <>
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          {ESTADOS.map(({ id, label, color }) => (
                            <div key={id}>
                              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                                {id === 'PROXIMO' ? `Próximos ${dias} días` : label}
                              </dt>
                              <dd className="text-xl font-bold tabular-nums">{conteoSel[id]}</dd>
                            </div>
                          ))}
                          <div>
                            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" /> Clientes
                            </dt>
                            <dd className="text-xl font-bold tabular-nums">{detalle.clientes}</dd>
                          </div>
                        </dl>

                        <div className="mt-4 border-t border-border pt-3">
                          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Empresas
                          </h3>
                          {empresasSel.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Ninguna empresa con equipos en los estados marcados.
                            </p>
                          ) : (
                            <ul className="max-h-[30rem] space-y-1 overflow-y-auto pr-1">
                              {empresasSel.map((emp) => {
                                const abierta = empresaAbierta === emp.id;
                                return (
                                  <li key={emp.id} className="rounded-md hover:bg-accent/50">
                                    <button
                                      type="button"
                                      onClick={() => setEmpresaAbierta(abierta ? null : emp.id)}
                                      aria-expanded={abierta}
                                      className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent ${
                                        abierta ? 'bg-accent' : ''
                                      }`}
                                    >
                                      <ChevronRight
                                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                                          abierta ? 'rotate-90' : ''
                                        }`}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium">
                                          {nombreEmpresa(emp.nombre)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                          {emp.ciudad && <span>{emp.ciudad}</span>}
                                          {ESTADOS.filter(({ id }) => visibles[id] && emp.c[id] > 0).map(
                                            ({ id, color }) => (
                                              <span key={id} className="inline-flex items-center gap-1">
                                                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                                                {emp.c[id]}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold leading-none tabular-nums">
                                          {emp.total}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">equipos</div>
                                      </div>
                                    </button>
                                    {abierta && (
                                      <EquiposEmpresa empresaId={emp.id} dias={dias} visibles={visibles} />
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Esta provincia no tiene equipos registrados.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Equipos por provincia</CardTitle>
                </CardHeader>
                <CardContent>
                  {ranking.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin datos para los estados marcados.</p>
                  ) : (
                    <ul className="space-y-1">
                      {ranking.map(({ k, c, total }) => {
                        const activa = k === seleccionada;
                        return (
                          <li key={k}>
                            <button
                              type="button"
                              onClick={() => setSeleccionada(activa ? null : k)}
                              className={`w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent ${
                                activa ? 'bg-accent' : ''
                              }`}
                            >
                              <div className="flex items-baseline justify-between text-sm">
                                <span className={activa ? 'font-semibold' : ''}>{NOMBRES.get(k) ?? k}</span>
                                <span className="font-medium tabular-nums">{total}</span>
                              </div>
                              {/* Barra apilada con los tres estados. */}
                              <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-muted">
                                {ESTADOS.filter(({ id }) => visibles[id] && c[id] > 0).map(({ id, color }) => (
                                  <div
                                    key={id}
                                    className="h-full"
                                    style={{ width: `${(c[id] / maxRanking) * 100}%`, background: color }}
                                  />
                                ))}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
