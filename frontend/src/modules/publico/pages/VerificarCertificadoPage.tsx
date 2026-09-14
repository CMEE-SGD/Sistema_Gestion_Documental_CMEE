// Página pública (sin sesión) a la que apunta el QR del sello de firma de
// Certificados — confirma la autenticidad de un certificado ante un tercero
// (cliente, auditor) sin necesitar cuenta en el sistema. Consume el mismo
// endpoint público GET /certificados/verificar/:codigo que ya existe.
//
// Contenido fiel al patrón de FirmaEC: su QR, al escanearse, muestra solo el
// nombre del firmante y la fecha de esa firma — no un resumen genérico del
// trámite. Como los 3 sellos de un mismo certificado (técnico/jefe/director)
// comparten el mismo código, aquí se listan las 3 firmas reales en vez de
// datos generales (cliente, orden de trabajo, etc.).
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldX, Loader2, PenLine } from 'lucide-react';
import api from '../../../core/api/axios';
import { logoCentro } from '../../../assets';

type Etapa = 'TECNICO' | 'JEFE' | 'DIRECTOR';
type Documento = 'reporte' | 'certificado';

interface FirmaVerificada {
  etapa: Etapa;
  documento: Documento;
  titular: string;
  fecha_firma: string;
}

interface VerificacionCertificado {
  valido: boolean;
  numero_certificado: string;
  nombre_documento: string;
  equipo: string;
  firmas: FirmaVerificada[];
}

type Estado = 'cargando' | 'valido' | 'no-encontrado';

const ETAPA_LABEL: Record<Etapa, string> = {
  TECNICO: 'Técnico',
  JEFE: 'Jefe de Laboratorio',
  DIRECTOR: 'Director',
};

const DOCUMENTO_LABEL: Record<Documento, string> = {
  reporte: 'Reporte',
  certificado: 'Certificado',
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FilaFirma({ firma }: { firma: FirmaVerificada }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <PenLine className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {ETAPA_LABEL[firma.etapa]} · {DOCUMENTO_LABEL[firma.documento]}
        </p>
        <p className="truncate text-sm font-semibold text-slate-800">{firma.titular}</p>
        <p className="text-xs text-slate-500">{formatearFecha(firma.fecha_firma)}</p>
      </div>
    </div>
  );
}

export default function VerificarCertificadoPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const [estado, setEstado] = useState<Estado>('cargando');
  const [datos, setDatos] = useState<VerificacionCertificado | null>(null);

  useEffect(() => {
    if (!codigo) {
      setEstado('no-encontrado');
      return;
    }
    let cancelado = false;
    api
      .get<VerificacionCertificado>(`/certificados/verificar/${codigo}`)
      .then((res) => {
        if (cancelado) return;
        setDatos(res.data);
        setEstado('valido');
      })
      .catch(() => {
        if (!cancelado) setEstado('no-encontrado');
      });
    return () => {
      cancelado = true;
    };
  }, [codigo]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <img src={logoCentro} alt="Logo CMEE" className="h-16 w-auto" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {estado === 'cargando' && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Verificando certificado…</p>
            </div>
          )}

          {estado === 'no-encontrado' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <ShieldX className="h-6 w-6 text-rose-600" />
              </div>
              <h1 className="text-lg font-bold text-slate-800">Código no encontrado</h1>
              <p className="text-sm text-slate-500">
                Este código de verificación no corresponde a ningún certificado emitido
                por el Centro de Metrología del Ejército Ecuatoriano.
              </p>
            </div>
          )}

          {estado === 'valido' && datos && (
            <>
              <div className="mb-4 flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h1 className="text-lg font-bold text-slate-800">Certificado auténtico</h1>
                <p className="truncate text-sm font-semibold text-slate-700">
                  {datos.nombre_documento}
                </p>
                <p className="text-sm text-slate-500">{datos.equipo}</p>
                <p className="text-xs text-slate-400">
                  Certificado N.° {datos.numero_certificado}
                </p>
              </div>

              <div className="flex flex-col">
                {datos.firmas.length > 0 ? (
                  datos.firmas.map((firma) => (
                    <FilaFirma key={firma.etapa} firma={firma} />
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">
                    Este certificado aún no registra firmas digitales.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Centro de Metrología del Ejército Ecuatoriano
        </p>
      </div>
    </div>
  );
}
