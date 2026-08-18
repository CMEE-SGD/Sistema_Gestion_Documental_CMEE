import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Search, ClipboardList, CheckCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';

const estadoStyles: Record<string, string> = {
  RECIBIDA: 'bg-gray-100 text-gray-700',
  EN_ANALISIS: 'bg-amber-100 text-amber-700',
  PROCEDENTE: 'bg-emerald-100 text-emerald-700',
  NO_PROCEDENTE: 'bg-red-100 text-red-700',
  EN_SEGUIMIENTO: 'bg-blue-100 text-blue-700',
  CERRADA: 'bg-emerald-100 text-emerald-700',
};

export const QuejaDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alert } = useAlert();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/calidad/quejas/${id}`);
        setItem(res.data);
      } catch {
        await alert({ message: 'No se pudo cargar la queja.' });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;
  if (!item) return <div className="p-6 text-center text-gray-400">Queja no encontrada</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/calidad/quejas')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Quejas
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800">{item.codigo}</h2>
            <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${estadoStyles[item.estado] || 'bg-gray-100 text-gray-500'}`}>
              {item.estado?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(item.estado === 'RECIBIDA' || item.estado === 'EN_ANALISIS') && (
              <Button
                variant="default"
                onClick={() => navigate(`/calidad/quejas/${item.id}/seguimiento?seccion=analisis`)}
              >
                <Search className="w-4 h-4 mr-1" /> Análisis
              </Button>
            )}
            {(item.estado === 'PROCEDENTE' || item.estado === 'EN_SEGUIMIENTO') && (
              <Button
                variant="default"
                onClick={() => navigate(`/calidad/quejas/${item.id}/seguimiento?seccion=acciones`)}
              >
                <ClipboardList className="w-4 h-4 mr-1" /> Acciones
              </Button>
            )}
            {item.estado === 'EN_SEGUIMIENTO' && (
              <Button
                variant="default"
                onClick={() => navigate(`/calidad/quejas/${item.id}/seguimiento?seccion=cierre`)}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Cierre
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => navigate(`/calidad/quejas/editar/${item.id}`)}
            >
              <Edit3 className="w-4 h-4 mr-1" /> Editar
            </Button>
          </div>
        </div>

        {/* RECEPCIÓN */}
        <div className="p-4">
          <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">
            RECEPCIÓN (atención al cliente)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
            <div><strong>Código:</strong> {item.codigo}</div>
            <div><strong>Cliente:</strong> {item.cliente || '—'}</div>
            <div><strong>Teléfono:</strong> {item.telefono_contacto || '—'}</div>
            <div><strong>Email:</strong> {item.email_contacto || '—'}</div>
            <div><strong>Formulado por:</strong> {item.formulado_por || '—'}</div>
            <div><strong>Fecha recepción:</strong> {item.recibida_fecha ? new Date(item.recibida_fecha).toLocaleDateString() : '—'}</div>
            <div><strong>Recibida por:</strong> {item.recibida_por || '—'}</div>
            <div><strong>Estado:</strong> <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${estadoStyles[item.estado]}`}>{item.estado?.replace(/_/g, ' ')}</span></div>
            <div className="md:col-span-4"><strong>Descripción:</strong> {item.descripcion_queja}</div>
          </div>
        </div>

        {/* ANÁLISIS (solo si tiene datos) */}
        {item.area_afectada && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-amber-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
              ANÁLISIS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
              <div><strong>Área afectada:</strong> {item.area_afectada}</div>
              <div><strong>Procedente:</strong> {item.procedente === true ? 'Sí' : item.procedente === false ? 'No' : '—'}</div>
              {item.procedente === true && item.num_iac && (
                <div><strong>Nº IAC:</strong> {item.num_iac}</div>
              )}
              {item.justificativo_no_procede && (
                <div className="md:col-span-4"><strong>Justificativo:</strong> {item.justificativo_no_procede}</div>
              )}
            </div>
          </div>
        )}

        {/* RESPONSABLES ANÁLISIS */}
        {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'ANALISIS') && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-amber-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
              RESPONSABLES - ANÁLISIS
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b">
              <table className="w-full text-sm text-gray-600">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="text-left px-4 py-2">Nombre</th>
                    <th className="text-left px-4 py-2">Cargo</th>
                    <th className="text-left px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {item.responsables.filter((r: any) => r.fase === 'ANALISIS').map((r: any, i: number) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="px-4 py-2">{r.nombre}</td>
                      <td className="px-4 py-2">{r.cargo || '—'}</td>
                      <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCIONES (solo si tiene datos) */}
        {item.acciones && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
              ACCIONES Y SEGUIMIENTO
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
              <div className="md:col-span-4"><strong>Acciones:</strong> {item.acciones}</div>
              <div><strong>Fecha límite:</strong> {item.fecha_limite ? new Date(item.fecha_limite).toLocaleDateString() : '—'}</div>
              {item.observaciones && (
                <div className="md:col-span-4"><strong>Observaciones:</strong> {item.observaciones}</div>
              )}
            </div>
          </div>
        )}

        {/* RESPONSABLES ACCIONES */}
        {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'ACCIONES') && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
              RESPONSABLES - ACCIONES
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b">
              <table className="w-full text-sm text-gray-600">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left px-4 py-2">Nombre</th>
                    <th className="text-left px-4 py-2">Cargo</th>
                    <th className="text-left px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {item.responsables.filter((r: any) => r.fase === 'ACCIONES').map((r: any, i: number) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="px-4 py-2">{r.nombre}</td>
                      <td className="px-4 py-2">{r.cargo || '—'}</td>
                      <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CIERRE (solo si tiene datos) */}
        {item.verificacion_eficacia && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-emerald-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
              CIERRE
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
              <div className="md:col-span-4"><strong>Verificación de eficacia:</strong> {item.verificacion_eficacia}</div>
              <div><strong>Fecha de cierre:</strong> {item.cierre_fecha ? new Date(item.cierre_fecha).toLocaleDateString() : '—'}</div>
              <div><strong>Cerrada por:</strong> {item.cerrada_por || '—'}</div>
            </div>
          </div>
        )}

        {/* RESPONSABLES CIERRE */}
        {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'CIERRE') && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-emerald-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
              RESPONSABLES - CIERRE
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b">
              <table className="w-full text-sm text-gray-600">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="text-left px-4 py-2">Nombre</th>
                    <th className="text-left px-4 py-2">Cargo</th>
                    <th className="text-left px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {item.responsables.filter((r: any) => r.fase === 'CIERRE').map((r: any, i: number) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="px-4 py-2">{r.nombre}</td>
                      <td className="px-4 py-2">{r.cargo || '—'}</td>
                      <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
