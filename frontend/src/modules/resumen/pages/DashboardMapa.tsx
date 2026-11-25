import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GeoJSON, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Feature, FeatureCollection } from 'geojson';
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
  MapPinned,
  Trophy,
  X,
} from 'lucide-react';
import provinciasGeoJson from '../data/provincias-ecuador.json';
import { PROVINCIAS_ECUADOR } from '../../../shared/data/provincias';

type Metrica = 'calibrados' | 'porCalibrar' | 'proximos';

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
  provincias: FilaProvincia[];
}

// Cada vista tiene su propio color, tomado de la matriz de riesgo del CMEE:
// verde = ya calibrado, amarillo/naranja = pendiente, rojo = vence pronto.
// `color` es el tono de botón; `fuerte` el de texto/iconos sobre fondo claro.
const METRICAS: {
  id: Metrica;
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  fuerte: string;
  textoSobreColor: string;
}[] = [
  { id: 'calibrados', label: 'Calibrados', icon: CheckCircle2, color: '#2f8a5c', fuerte: '#1f7a4d', textoSobreColor: '#ffffff' },
  { id: 'porCalibrar', label: 'Por calibrar', icon: Hourglass, color: '#f5b400', fuerte: '#a16207', textoSobreColor: '#1f2937' },
  { id: 'proximos', label: 'Tentativa de próxima calibración', icon: CalendarClock, color: '#d62839', fuerte: '#b91c3c', textoSobreColor: '#ffffff' },
];

const DIAS_OPCIONES = [30, 60, 90, 180];

// Rampas secuenciales de un solo tono por vista: más oscuro = más equipos.
const RAMPAS: Record<Metrica, string[]> = {
  calibrados: ['#d7f0e2', '#9fd8b9', '#55af82', '#2f8a5c', '#1b5e3f'],
  porCalibrar: ['#fff3c4', '#ffe082', '#ffc400', '#f08a00', '#b45309'],
  proximos: ['#fde2e4', '#f9a3a8', '#f2545b', '#d62839', '#8f1d2c'],
};
const COLOR_VACIO = '#e5e7eb';
const COLOR_CONTORNO = '#6b7280';
const COLOR_SELECCION = '#0f172a';

// Mapa base a color: teselas estándar de OpenStreetMap (sin API key). Se
// descargan de un servidor externo; si la red institucional lo bloquea, el mapa
// sigue funcionando sobre el fondo liso.
const MAPA_BASE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const geo = provinciasGeoJson as FeatureCollection;

// El GeoJSON trae "Sucumbios"/"Manabi" sin tilde; el catálogo del backend sí
// la lleva. Se compara sin acentos y en minúsculas.
const clave = (nombre: string) =>
  nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const NOMBRES = new Map<string, string>(PROVINCIAS_ECUADOR.map((p) => [clave(p), p]));

function colorPara(valor: number, max: number, rampa: string[]): string {
  if (valor <= 0 || max <= 0) return COLOR_VACIO;
  const idx = Math.min(rampa.length - 1, Math.ceil((valor / max) * rampa.length) - 1);
  return rampa[idx];
}

function ClicFuera({ alt }: { alt: () => void }) {
  useMapEvents({ click: alt });
  return null;
}

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

// Equipos de una empresa, filtrados según la vista activa (calibrados, por
// calibrar o próximos a vencer) con opción de ver todos. Se pide al abrirse.
function EquiposEmpresa({
  empresaId,
  dias,
  metrica,
  color,
}: {
  empresaId: number;
  dias: number;
  metrica: Metrica;
  color: string;
}) {
  const [verTodos, setVerTodos] = useState(false);
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

  const coincide = (e: EquipoEmpresa) =>
    metrica === 'calibrados' ? e.calibrado : metrica === 'porCalibrar' ? !e.calibrado : e.proximo;
  const filtrados = verTodos ? data.equipos : data.equipos.filter(coincide);

  return (
    <div className="mb-2 ml-6 mr-1 mt-1 space-y-1.5 border-l-2 pl-3" style={{ borderColor: color }}>
      {filtrados.length === 0 && (
        <p className="py-1 text-xs text-muted-foreground">Sin equipos en este filtro.</p>
      )}
      {filtrados.map((e) => {
        const detalle = [e.marca, e.modelo].filter(Boolean).join(' ');
        return (
          <div key={e.id} className="rounded-md border border-border bg-background px-2.5 py-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-tight">{e.descripcion}</span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={
                  e.calibrado
                    ? { background: '#2f8a5c22', color: '#1f7a4d' }
                    : { background: '#f5b40033', color: '#a16207' }
                }
              >
                {e.calibrado ? 'Calibrado' : 'Por calibrar'}
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
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Calibración
                </dt>
                <dd className="font-medium">{fmtFecha(e.fechaCalibracion) ?? 'Sin registrar'}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Próxima
                </dt>
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
      <button
        type="button"
        onClick={() => setVerTodos((v) => !v)}
        className="text-xs font-medium text-primary hover:underline"
      >
        {verTodos
          ? 'Ver solo los de este filtro'
          : `Ver todos los equipos de la empresa (${data.equipos.length})`}
      </button>
    </div>
  );
}

export default function DashboardMapa() {
  const [metrica, setMetrica] = useState<Metrica>('calibrados');
  const [dias, setDias] = useState(60);
  const [mapaBase, setMapaBase] = useState(true);
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

  const max = useMemo(
    () => Math.max(0, ...(data?.provincias.map((p) => p[metrica]) ?? [])),
    [data, metrica],
  );

  const ranking = useMemo(
    () =>
      [...(data?.provincias ?? [])]
        .filter((p) => p[metrica] > 0)
        .sort((a, b) => b[metrica] - a[metrica]),
    [data, metrica],
  );

  const total = ranking.reduce((acc, p) => acc + p[metrica], 0);
  const infoMetrica = METRICAS.find((m) => m.id === metrica)!;
  const etiquetaMetrica = infoMetrica.label;
  const rampa = RAMPAS[metrica];

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
      const valor = porClave.get(k)?.[metrica] ?? 0;
      const esSel = k === seleccionada;
      return {
        fillColor: colorPara(valor, max, RAMPAS[metrica]),
        // Con el mapa base de fondo, el color de datos queda translúcido para
        // que se vean ciudades y vías; las provincias sin datos casi no se pintan.
        fillOpacity: mapaBase ? (valor > 0 ? 0.68 : 0.05) : 0.92,
        color: esSel ? COLOR_SELECCION : COLOR_CONTORNO,
        weight: esSel ? 3.5 : 1,
        opacity: 1,
      };
    },
    [porClave, metrica, max, mapaBase, seleccionada],
  );

  const textoTooltip = useCallback(
    (k: string, nombreGeo: string) => {
      const nombre = NOMBRES.get(k) ?? nombreGeo;
      const valor = porClave.get(k)?.[metrica] ?? 0;
      return `<strong>${nombre}</strong><br/>${etiquetaMetrica}: ${valor}`;
    },
    [porClave, metrica, etiquetaMetrica],
  );

  // El contorno de selección y el relleno viven en el estilo de cada capa; se
  // reaplican cuando cambia el filtro o la selección, sin recrear el GeoJSON.
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
      if (k === seleccionada) capa.bringToFront();
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
        capa.bringToFront();
      },
      mouseout: () => capa.setStyle(estiloRef.current(k)),
    });
  };

  const detalle = seleccionada ? porClave.get(seleccionada) : undefined;
  // Empresas de la provincia elegida, ordenadas por el filtro activo.
  const empresasSel = useMemo(
    () =>
      [...(detalle?.empresas ?? [])]
        .filter((e) => e[metrica] > 0)
        .sort((a, b) => b[metrica] - a[metrica] || a.nombre.localeCompare(b.nombre, 'es')),
    [detalle, metrica],
  );
  const lider = ranking[0];

  return (
    <div className="space-y-6 p-6">
      {/* El navegador dibuja un recuadro de foco sobre el path SVG al hacer clic;
          la selección se muestra con el contorno de la provincia. */}
      <style>{`
        .leaflet-container path.leaflet-interactive:focus { outline: none; }
        .leaflet-container { font-family: inherit; }
      `}</style>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mapa de calor</h1>
        <p className="text-sm text-muted-foreground">
          Equipos recibidos por el centro, según la provincia de su cliente.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          {METRICAS.map(({ id, label, icon: Icon, color, textoSobreColor }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMetrica(id)}
              style={metrica === id ? { background: color, color: textoSobreColor } : undefined}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                metrica === id ? '' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {metrica === 'proximos' && (
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            Vencen en los próximos
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
        )}

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
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className="rounded-lg p-2"
                  style={{ background: `${infoMetrica.color}26`, color: infoMetrica.fuerte }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{total}</div>
                  <div className="text-xs text-muted-foreground">
                    Equipos · {etiquetaMetrica.toLowerCase()}
                    {metrica === 'proximos' ? ` (${dias} días)` : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className="rounded-lg p-2"
                  style={{ background: `${infoMetrica.color}26`, color: infoMetrica.fuerte }}
                >
                  <MapPinned className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold tabular-nums">
                    {ranking.length}
                    <span className="text-base font-normal text-muted-foreground">
                      {' '}
                      de {PROVINCIAS_ECUADOR.length}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Provincias con equipos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className="rounded-lg p-2"
                  style={{ background: `${infoMetrica.color}26`, color: infoMetrica.fuerte }}
                >
                  <Trophy className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold">{lider ? lider.provincia : '—'}</div>
                  <div className="text-xs text-muted-foreground">
                    {lider ? `Provincia con más equipos (${lider[metrica]})` : 'Sin datos'}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <ClicFuera alt={() => setSeleccionada(null)} />
                </MapContainer>
                <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  <span>Menos</span>
                  <div className="flex">
                    {[COLOR_VACIO, ...rampa].map((c) => (
                      <span
                        key={c}
                        className="h-3 w-8 border border-border/50"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span>Más{max > 0 ? ` (máx. ${max})` : ''}</span>
                  <span className="ml-auto">
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
                    {detalle ? (
                      <>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Calibrados</dt>
                          <dd className="text-xl font-bold tabular-nums">{detalle.calibrados}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Por calibrar</dt>
                          <dd className="text-xl font-bold tabular-nums">{detalle.porCalibrar}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Próximos {dias} días</dt>
                          <dd className="text-xl font-bold tabular-nums">{detalle.proximos}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" /> Clientes
                          </dt>
                          <dd className="text-xl font-bold tabular-nums">{detalle.clientes}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 border-t border-border pt-3">
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Empresas · {etiquetaMetrica.toLowerCase()}
                        </h3>
                        {empresasSel.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Ninguna empresa con equipos en este filtro.
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
                                      <div className="truncate text-xs text-muted-foreground">
                                        {emp.ciudad ? `${emp.ciudad} · ` : ''}
                                        {emp.calibrados} calibrados · {emp.porCalibrar} por calibrar
                                        {emp.proximos > 0 ? ` · ${emp.proximos} próx.` : ''}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold leading-none tabular-nums">
                                        {emp[metrica]}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">equipos</div>
                                    </div>
                                  </button>
                                  {abierta && (
                                    <EquiposEmpresa
                                      key={`${emp.id}-${metrica}`}
                                      empresaId={emp.id}
                                      dias={dias}
                                      metrica={metrica}
                                      color={infoMetrica.fuerte}
                                    />
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
                  <CardTitle className="text-sm font-medium">
                    {etiquetaMetrica} por provincia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ranking.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin datos para este filtro.</p>
                  ) : (
                    <ul className="space-y-1">
                      {ranking.map((p) => {
                        const k = clave(p.provincia);
                        const activa = k === seleccionada;
                        return (
                          <li key={p.provincia}>
                            <button
                              type="button"
                              onClick={() => setSeleccionada(activa ? null : k)}
                              className={`w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent ${
                                activa ? 'bg-accent' : ''
                              }`}
                            >
                              <div className="flex items-baseline justify-between text-sm">
                                <span className={activa ? 'font-semibold' : ''}>{p.provincia}</span>
                                <span className="font-medium tabular-nums">{p[metrica]}</span>
                              </div>
                              <div className="mt-1 h-1.5 rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(p[metrica] / max) * 100}%`,
                                    background: colorPara(p[metrica], max, rampa),
                                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                                  }}
                                />
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
