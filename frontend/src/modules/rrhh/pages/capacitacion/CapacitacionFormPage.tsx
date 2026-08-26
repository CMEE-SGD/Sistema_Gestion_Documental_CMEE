import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import api from '../../../../core/api/axios';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { decodeId, encodeId } from '../../../../shared/utils/ids';

export const CapacitacionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const esEdicion = Boolean(id);
  const decodedId = id ? decodeId(id) : null;

  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: today,
    fecha_fin: today,
    horas: '',
    lugar: '',
    proveedor: '',
    estado: 'PROGRAMADA',
    observaciones: '',
  });
  const [busquedaPersona, setBusquedaPersona] = useState('');
  const [personaIds, setPersonaIds] = useState<number[]>([]);

  useEffect(() => {
    api.get('/personas').then(res => {
      setPersonas(res.data.filter((p: any) => p.estado === 'ACTIVO'));
    });
    if (esEdicion && decodedId) {
      api.get(`/capacitaciones/${decodedId}`).then(res => {
        const c = res.data;
        setForm({
          nombre: c.nombre || '',
          fecha_inicio: c.fecha_inicio ? c.fecha_inicio.split('T')[0] : '',
          fecha_fin: c.fecha_fin ? c.fecha_fin.split('T')[0] : '',
          horas: String(c.horas || ''),
          lugar: c.lugar || '',
          proveedor: c.proveedor || '',
          estado: c.estado || 'PROGRAMADA',
          observaciones: c.observaciones || '',
        });
        setPersonaIds(c.participantes?.map((p: any) => p.persona_id) || []);
      });
    }
  }, [id, esEdicion, decodedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePersona = (pid: number) => {
    setPersonaIds(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        horas: parseFloat(form.horas) || 0,
        persona_ids: personaIds,
      };
      if (esEdicion && decodedId) {
        await api.patch(`/capacitaciones/${decodedId}`, payload);
        toast({ message: 'Capacitación actualizada correctamente' });
        navigate(`/rrhh/capacitaciones/${id}`);
      } else {
        const res = await api.post('/capacitaciones', payload);
        toast({ message: 'Capacitación creada correctamente' });
        navigate(`/rrhh/capacitaciones/${encodeId(res.data.id)}`);
      }
    } catch (err: any) {
      toast({ message: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <GraduationCap className="w-5 h-5 text-blue-600" />
        <h1 className="text-lg font-bold text-gray-800">{esEdicion ? 'Editar' : 'Nueva'} Capacitación</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nombre del curso *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha inicio *</label>
            <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha fin *</label>
            <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Horas *</label>
            <input type="number" name="horas" value={form.horas} onChange={handleChange} required min="0" step="0.5"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option value="PROGRAMADA">Programada</option>
              <option value="EN_CURSO">En curso</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Lugar</label>
            <input type="text" name="lugar" value={form.lugar} onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Proveedor</label>
            <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Observaciones</label>
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={3}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 resize-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Participantes</label>
          {personas.length > 0 && (
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busquedaPersona}
              onChange={e => setBusquedaPersona(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          )}
          <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
            {personas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay personas registradas</p>
            ) : (
              personas
                .filter(p => {
                  if (!busquedaPersona.trim()) return true;
                  const q = busquedaPersona.toLowerCase();
                  return `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q);
                })
                .map(p => (
                <label key={p.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={personaIds.includes(p.id)}
                    onChange={() => togglePersona(p.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{p.nombre} {p.apellidos}</span>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-gray-400">{personaIds.length} seleccionados</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="clasico" disabled={loading}>
            {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
          </Button>
          <Button type="button" variant="clasico" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};
