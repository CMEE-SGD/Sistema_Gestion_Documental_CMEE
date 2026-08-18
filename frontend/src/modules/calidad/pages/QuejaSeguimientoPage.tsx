import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';

interface ResponsableRow {
  nombre: string;
  cargo: string;
  fecha: string;
}

const emptyResp = (): ResponsableRow => ({ nombre: '', cargo: '', fecha: '' });

export const QuejaSeguimientoPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const seccion = searchParams.get('seccion') || 'analisis';
  const navigate = useNavigate();
  const { alert } = useAlert();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [form, setForm] = useState<any>({});

  const [responsables, setResponsables] = useState<ResponsableRow[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/calidad/quejas/${id}`);
        const r = res.data;
        setCodigo(r.codigo);
        setForm({
          area_afectada: r.area_afectada || 'TECNICA',
          procedente: r.procedente ?? '',
          num_iac: r.num_iac || '',
          justificativo_no_procede: r.justificativo_no_procede || '',
          estado: r.estado || 'RECIBIDA',
          acciones: r.acciones || '',
          fecha_limite: r.fecha_limite ? r.fecha_limite.slice(0, 10) : '',
          observaciones: r.observaciones || '',
          verificacion_eficacia: r.verificacion_eficacia || '',
          cierre_fecha: r.cierre_fecha ? r.cierre_fecha.slice(0, 10) : '',
          cerrada_por: r.cerrada_por || '',
        });
        if (Array.isArray(r.responsables)) {
          const faseMap: Record<string, string> = { analisis: 'ANALISIS', acciones: 'ACCIONES', cierre: 'CIERRE' };
          const faseActual = faseMap[seccion] || 'ANALISIS';
          const filtered = r.responsables.filter((x: any) => x.fase === faseActual);
          if (filtered.length > 0) {
            setResponsables(filtered.map((x: any) => ({
              nombre: x.nombre || '',
              cargo: x.cargo || '',
              fecha: x.fecha ? x.fecha.slice(0, 10) : '',
            })));
          }
        }
      } catch {
        await alert({ message: 'No se pudo cargar la queja.' });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, seccion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleRespChange = (idx: number, field: keyof ResponsableRow, value: string) => {
    setResponsables(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addResp = () => setResponsables(prev => [...prev, emptyResp()]);
  const removeResp = (idx: number) => setResponsables(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const faseMap: Record<string, string> = { analisis: 'ANALISIS', acciones: 'ACCIONES', cierre: 'CIERRE' };
      const faseActual = faseMap[seccion] || 'ANALISIS';

      let payload: any = {};
      if (seccion === 'analisis') {
        payload = {
          area_afectada: form.area_afectada,
          procedente: form.procedente === true ? true : form.procedente === false ? false : null,
          num_iac: form.procedente === true ? (form.num_iac || null) : null,
          justificativo_no_procede: form.justificativo_no_procede || null,
          estado: form.estado,
          responsables: responsables.filter(r => r.nombre.trim()).map(r => ({
            fase: faseActual,
            nombre: r.nombre,
            cargo: r.cargo || null,
            fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
          })),
        };
      } else if (seccion === 'acciones') {
        payload = {
          acciones: form.acciones || null,
          fecha_limite: form.fecha_limite ? new Date(form.fecha_limite).toISOString() : null,
          observaciones: form.observaciones || null,
          estado: 'EN_SEGUIMIENTO',
          responsables: responsables.filter(r => r.nombre.trim()).map(r => ({
            fase: faseActual,
            nombre: r.nombre,
            cargo: r.cargo || null,
            fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
          })),
        };
      } else if (seccion === 'cierre') {
        payload = {
          verificacion_eficacia: form.verificacion_eficacia || null,
          cierre_fecha: form.cierre_fecha ? new Date(form.cierre_fecha).toISOString() : null,
          cerrada_por: form.cerrada_por || null,
          estado: 'CERRADA',
          responsables: responsables.filter(r => r.nombre.trim()).map(r => ({
            fase: faseActual,
            nombre: r.nombre,
            cargo: r.cargo || null,
            fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
          })),
        };
      }
      await api.patch(`/calidad/quejas/${id}`, payload);
      toast({ message: 'Seguimiento actualizado correctamente.' });
      navigate(`/calidad/quejas/${id}`);
    } catch (error: any) {
      await alert({ message: error?.response?.data?.message || 'Error al guardar el seguimiento.' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;

  const renderResponsables = () => (
    <div className="mt-4">
      <label className="text-sm font-medium text-gray-700 mb-2 block">Responsables</label>
      {responsables.map((r, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Nombre</label>
            <input type="text" value={r.nombre} onChange={e => handleRespChange(idx, 'nombre', e.target.value)} className={inputCls} placeholder="Nombre completo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Cargo</label>
            <input type="text" value={r.cargo} onChange={e => handleRespChange(idx, 'cargo', e.target.value)} className={inputCls} placeholder="Cargo o función" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Fecha</label>
            <div className="flex gap-2">
              <input type="date" value={r.fecha} onChange={e => handleRespChange(idx, 'fecha', e.target.value)} className={inputCls} />
              <button type="button" onClick={() => removeResp(idx)} className="px-2 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addResp} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors">
        <Plus className="w-4 h-4" /> Agregar responsable
      </button>
    </div>
  );

  const secciones: Record<string, { titulo: string; color: string; contenido: JSX.Element }> = {
    analisis: {
      titulo: 'ANÁLISIS',
      color: 'bg-amber-500',
      contenido: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Área afectada</label>
            <select name="area_afectada" value={form.area_afectada} onChange={handleChange} className={`${inputCls} bg-white`}>
              <option value="TECNICA">Técnica</option>
              <option value="GESTION_CALIDAD">Gestión de Calidad</option>
              <option value="ADMINISTRATIVA">Administrativa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">¿Procedente?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="procedente" checked={form.procedente === true} onChange={() => setForm((prev: any) => ({ ...prev, procedente: true }))} className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="procedente" checked={form.procedente === false} onChange={() => setForm((prev: any) => ({ ...prev, procedente: false, justificativo_no_procede: '', num_iac: '' }))} className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
          {form.procedente === true && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nº de IAC abierto</label>
              <input type="text" name="num_iac" value={form.num_iac} onChange={handleChange} className={inputCls} placeholder="Ej: IAC-2026-001" />
            </div>
          )}
          {form.procedente === false && (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Justificativo de no procedencia</label>
              <textarea
                name="justificativo_no_procede"
                value={form.justificativo_no_procede}
                onChange={handleChange}
                rows={3}
                className={inputCls}
                placeholder="Indique el motivo por el cual la queja no procede..."
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className={`${inputCls} bg-white`}>
              <option value="EN_ANALISIS">En análisis</option>
              <option value="PROCEDENTE">Procedente</option>
              <option value="NO_PROCEDENTE">No procedente</option>
            </select>
          </div>
          {renderResponsables()}
        </div>
      ),
    },
    acciones: {
      titulo: 'ACCIONES Y SEGUIMIENTO',
      color: 'bg-blue-500',
      contenido: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Acciones a tomar</label>
            <textarea
              name="acciones"
              value={form.acciones}
              onChange={handleChange}
              rows={3}
              className={inputCls}
              placeholder="Describa las acciones a realizar..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Fecha límite</label>
            <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={2}
              className={inputCls}
              placeholder="Observaciones adicionales..."
            />
          </div>
          {renderResponsables()}
        </div>
      ),
    },
    cierre: {
      titulo: 'CIERRE',
      color: 'bg-emerald-500',
      contenido: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-gray-300 rounded-b p-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Verificación de eficacia</label>
            <textarea
              name="verificacion_eficacia"
              value={form.verificacion_eficacia}
              onChange={handleChange}
              rows={3}
              className={inputCls}
              placeholder="Verificación de que las acciones fueron eficaces..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Fecha de cierre</label>
            <input type="date" name="cierre_fecha" value={form.cierre_fecha} onChange={handleChange} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Cerrada por</label>
            <input
              type="text"
              name="cerrada_por"
              value={form.cerrada_por}
              onChange={handleChange}
              className={inputCls}
              placeholder="Nombre de quien cierra"
            />
          </div>
          {renderResponsables()}
        </div>
      ),
    },
  };

  const sec = secciones[seccion] || secciones.analisis;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(`/calidad/quejas/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a {codigo}
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className={`${sec.color} text-white px-3 py-2 text-sm font-semibold rounded-t`}>
            {sec.titulo}
          </div>
          {sec.contenido}
        </div>

        <div className="flex justify-end gap-3 px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate(`/calidad/quejas/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" disabled={guardando}>
            <Save className="w-4 h-4 mr-1" /> {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
};
