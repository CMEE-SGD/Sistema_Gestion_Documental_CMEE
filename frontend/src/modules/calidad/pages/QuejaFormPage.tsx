import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../shared/utils/ids';

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500';

interface ResponsableRow {
  nombre: string;
  cargo: string;
  fecha: string;
}

const emptyResp = (): ResponsableRow => ({ nombre: '', cargo: '', fecha: '' });

const RespSection = ({ title, items, onChange, onAdd, onRemove }: {
  title: string;
  items: ResponsableRow[];
  onChange: (idx: number, field: keyof ResponsableRow, value: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) => (
  <div className="mt-3 pt-3 border-t border-gray-200">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{title}</label>
    {items.map((r, idx) => (
      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 p-2 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Nombre</label>
          <input type="text" value={r.nombre} onChange={e => onChange(idx, 'nombre', e.target.value)} className={inputCls} placeholder="Nombre completo" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Cargo</label>
          <input type="text" value={r.cargo} onChange={e => onChange(idx, 'cargo', e.target.value)} className={inputCls} placeholder="Cargo o función" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Fecha</label>
          <div className="flex gap-2">
            <input type="date" value={r.fecha} onChange={e => onChange(idx, 'fecha', e.target.value)} className={inputCls} />
            <button type="button" onClick={() => onRemove(idx)} className="px-2 text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
    <button type="button" onClick={onAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors mt-1">
      <Plus className="w-3 h-3" /> Agregar responsable
    </button>
  </div>
);

export const QuejaFormPage = () => {
  const { id: rawId } = useParams<{id: string}>();
  const id = decodeId(rawId!);
  const navigate = useNavigate();
  const { alert } = useAlert();
  const { toast } = useToast();
  const esEdicion = !!id;
  const [loading, setLoading] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    cliente: '',
    telefono_contacto: '',
    email_contacto: '',
    formulado_por: '',
    descripcion_queja: '',
    recibida_por: '',
    recibida_fecha: '',
    estado: 'RECIBIDA',
    area_afectada: 'TECNICA',
    procedente: '' as boolean | string,
    num_iac: '',
    justificativo_no_procede: '',
    acciones: '',
    fecha_limite: '',
    verificacion_eficacia: '',
    cierre_fecha: '',
    cerrada_por: '',
    observaciones: '',
  });

  const [respAnalisis, setRespAnalisis] = useState<ResponsableRow[]>([]);
  const [respAcciones, setRespAcciones] = useState<ResponsableRow[]>([]);
  const [respCierre, setRespCierre] = useState<ResponsableRow[]>([]);

  useEffect(() => {
    if (!esEdicion) return;
    const cargar = async () => {
      try {
        const res = await api.get(`/calidad/quejas/${id}`);
        const r = res.data;
        setForm({
          cliente: r.cliente || '',
          telefono_contacto: r.telefono_contacto || '',
          email_contacto: r.email_contacto || '',
          formulado_por: r.formulado_por || '',
          descripcion_queja: r.descripcion_queja || '',
          recibida_por: r.recibida_por || '',
          recibida_fecha: r.recibida_fecha ? r.recibida_fecha.slice(0, 10) : '',
          estado: r.estado || 'RECIBIDA',
          area_afectada: r.area_afectada || 'TECNICA',
          procedente: r.procedente ?? '',
          num_iac: r.num_iac || '',
          justificativo_no_procede: r.justificativo_no_procede || '',
          acciones: r.acciones || '',
          fecha_limite: r.fecha_limite ? r.fecha_limite.slice(0, 10) : '',
          verificacion_eficacia: r.verificacion_eficacia || '',
          cierre_fecha: r.cierre_fecha ? r.cierre_fecha.slice(0, 10) : '',
          cerrada_por: r.cerrada_por || '',
          observaciones: r.observaciones || '',
        });
        if (Array.isArray(r.responsables)) {
          const toRow = (x: any): ResponsableRow => ({
            nombre: x.nombre || '',
            cargo: x.cargo || '',
            fecha: x.fecha ? x.fecha.slice(0, 10) : '',
          });
          setRespAnalisis(r.responsables.filter((x: any) => x.fase === 'ANALISIS').map(toRow));
          setRespAcciones(r.responsables.filter((x: any) => x.fase === 'ACCIONES').map(toRow));
          setRespCierre(r.responsables.filter((x: any) => x.fase === 'CIERRE').map(toRow));
        }
      } catch {
        await alert({ message: 'No se pudo cargar la queja.' });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const makeRespHandlers = (setter: React.Dispatch<React.SetStateAction<ResponsableRow[]>>) => ({
    onChange: (idx: number, field: keyof ResponsableRow, value: string) =>
      setter(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r)),
    onAdd: () => setter(prev => [...prev, emptyResp()]),
    onRemove: (idx: number) => setter(prev => prev.filter((_, i) => i !== idx)),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const buildResp = (items: ResponsableRow[], fase: string) =>
        items.filter(r => r.nombre.trim()).map(r => ({
          fase,
          nombre: r.nombre,
          cargo: r.cargo || null,
          fecha: r.fecha || null,
        }));

      const allResponsables = [
        ...buildResp(respAnalisis, 'ANALISIS'),
        ...buildResp(respAcciones, 'ACCIONES'),
        ...buildResp(respCierre, 'CIERRE'),
      ];

      const payload: any = {
        cliente: form.cliente,
        telefono_contacto: form.telefono_contacto,
        email_contacto: form.email_contacto,
        formulado_por: form.formulado_por,
        descripcion_queja: form.descripcion_queja,
        recibida_por: form.recibida_por,
        recibida_fecha: form.recibida_fecha || null,
      };
      if (esEdicion) {
        Object.assign(payload, {
          area_afectada: form.area_afectada || null,
          procedente: form.procedente === true ? true : form.procedente === false ? false : null,
          num_iac: form.num_iac || null,
          justificativo_no_procede: form.justificativo_no_procede || null,
          acciones: form.acciones || null,
          fecha_limite: form.fecha_limite || null,
          verificacion_eficacia: form.verificacion_eficacia || null,
          cierre_fecha: form.cierre_fecha || null,
          cerrada_por: form.cerrada_por || null,
          observaciones: form.observaciones || null,
          responsables: allResponsables,
        });
        await api.patch(`/calidad/quejas/${id}`, payload);
        toast({ message: 'Queja actualizada correctamente.' });
      } else {
        await api.post('/calidad/quejas', payload);
        toast({ message: 'Queja registrada correctamente.' });
      }
      navigate('/calidad/quejas');
    } catch (error: any) {
      await alert({ message: error?.response?.data?.message || 'Error al guardar la queja.' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;

  const showAnalisis = esEdicion && (form.procedente !== '' && form.procedente !== null);
  const showAcciones = esEdicion && !!form.acciones;
  const showCierre = esEdicion && !!form.verificacion_eficacia;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/calidad/quejas')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Quejas
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

        {/* ============ RECEPCIÓN ============ */}
        <div className="bg-[#88bddf] text-white px-4 py-3 text-sm font-semibold">
          RECEPCIÓN (atención al cliente)
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">CLIENTE (Nombre Empresa)</label>
            <input type="text" name="cliente" value={form.cliente} onChange={handleChange} className={inputCls} placeholder="Nombre de la empresa o cliente" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">TELÉFONO</label>
            <input type="text" name="telefono_contacto" value={form.telefono_contacto} onChange={handleChange} className={inputCls} placeholder="Ej: 555-1234" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">CORREO ELECTRÓNICO</label>
            <input type="text" name="email_contacto" value={form.email_contacto} onChange={handleChange} className={inputCls} placeholder="correo@empresa.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">FORMULADA POR (Persona representante cliente)</label>
            <input type="text" name="formulado_por" value={form.formulado_por} onChange={handleChange} className={inputCls} placeholder="Nombre del representante" />
          </div>
          <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
            <strong>NOTA:</strong> Si la parte interesada requiere una descripción del proceso de tratamiento de quejas, lo hará mediante oficio dirigido a la dirección del CMEE.
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">BREVE DESCRIPCIÓN DE LA QUEJA</label>
            <textarea name="descripcion_queja" value={form.descripcion_queja} onChange={handleChange} rows={4} className={inputCls} placeholder="Describa brevemente la queja recibida..." required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">RECEPCIONADA POR (Nombres, Cargo)</label>
            <input type="text" name="recibida_por" value={form.recibida_por} onChange={handleChange} className={inputCls} placeholder="Nombres y cargo de quien recibe" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">FECHA DE RECEPCIÓN</label>
            <input type="date" name="recibida_fecha" value={form.recibida_fecha} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        {/* ============ ANÁLISIS ============ */}
        {showAnalisis && (
          <>
            <div className="bg-amber-500 text-white px-4 py-3 text-sm font-semibold">
              ANÁLISIS
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <input type="radio" name="procedente" checked={form.procedente === true} onChange={() => setForm(prev => ({ ...prev, procedente: true }))} className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-700">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="procedente" checked={form.procedente === false} onChange={() => setForm(prev => ({ ...prev, procedente: false, justificativo_no_procede: '', num_iac: '' }))} className="w-4 h-4 text-red-600" />
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
                  <textarea name="justificativo_no_procede" value={form.justificativo_no_procede} onChange={handleChange} rows={3} className={inputCls} placeholder="Indique el motivo por el cual la queja no procede..." />
                </div>
              )}
              <div className="md:col-span-2">
                <RespSection title="Responsables de Análisis" items={respAnalisis} {...makeRespHandlers(setRespAnalisis)} />
              </div>
            </div>
          </>
        )}

        {/* ============ ACCIONES ============ */}
        {showAcciones && (
          <>
            <div className="bg-blue-500 text-white px-4 py-3 text-sm font-semibold">
              ACCIONES Y SEGUIMIENTO
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Acciones a tomar</label>
                <textarea name="acciones" value={form.acciones} onChange={handleChange} rows={3} className={inputCls} placeholder="Describa las acciones a realizar..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Fecha límite</label>
                <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Observaciones</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={2} className={inputCls} placeholder="Observaciones adicionales..." />
              </div>
              <div className="md:col-span-2">
                <RespSection title="Responsables de Acciones" items={respAcciones} {...makeRespHandlers(setRespAcciones)} />
              </div>
            </div>
          </>
        )}

        {/* ============ CIERRE ============ */}
        {showCierre && (
          <>
            <div className="bg-emerald-500 text-white px-4 py-3 text-sm font-semibold">
              CIERRE
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Verificación de eficacia</label>
                <textarea name="verificacion_eficacia" value={form.verificacion_eficacia} onChange={handleChange} rows={3} className={inputCls} placeholder="Verificación de que las acciones fueron eficaces..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Fecha de cierre</label>
                <input type="date" name="cierre_fecha" value={form.cierre_fecha} onChange={handleChange} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Cerrada por</label>
                <input type="text" name="cerrada_por" value={form.cerrada_por} onChange={handleChange} className={inputCls} placeholder="Nombre de quien cierra" />
              </div>
              <div className="md:col-span-2">
                <RespSection title="Responsables de Cierre" items={respCierre} {...makeRespHandlers(setRespCierre)} />
              </div>
            </div>
          </>
        )}

        {/* ============ BOTONES ============ */}
        <div className="flex justify-end gap-3 px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate(esEdicion ? `/calidad/quejas/${encodeId(id)}` : '/calidad/quejas')}
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
