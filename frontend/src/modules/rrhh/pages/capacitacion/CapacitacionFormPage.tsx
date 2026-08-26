import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { GraduationCap, ArrowLeft, FileText } from 'lucide-react';
import api from '../../../../core/api/axios';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { decodeId, encodeId } from '../../../../shared/utils/ids';
import { buildFileUrl } from '../../../../shared/utils/backendUrl';

interface Persona {
  id: number;
  nombre: string;
  apellidos: string;
}

interface ParticipanteCert {
  personaId: number;
  archivo: File | null;
  existente: string | null;
}

export const CapacitacionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const esEdicion = Boolean(id);
  const decodedId = id ? decodeId(id) : null;

  const personaQueryId = searchParams.get('persona');
  const decodedPersonaId = personaQueryId ? decodeId(personaQueryId) : null;

  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
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
  const [certificados, setCertificados] = useState<Record<number, ParticipanteCert>>({});

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
        const pids: number[] = c.participantes?.map((p: any) => p.persona_id) || [];
        setPersonaIds(pids);
        const certs: Record<number, ParticipanteCert> = {};
        c.participantes?.forEach((p: any) => {
          certs[p.persona_id] = { personaId: p.persona_id, archivo: null, existente: p.certificado || null };
        });
        setCertificados(certs);
      });
    }
  }, [id, esEdicion, decodedId]);

  useEffect(() => {
    if (decodedPersonaId && !esEdicion) {
      const pid = Number(decodedPersonaId);
      setPersonaIds(prev => prev.includes(pid) ? prev : [...prev, pid]);
    }
  }, [decodedPersonaId, esEdicion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePersona = (pid: number) => {
    setPersonaIds(prev => {
      const next = prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid];
      if (!next.includes(pid)) {
        setCertificados(prev => {
          const c = { ...prev };
          delete c[pid];
          return c;
        });
      }
      return next;
    });
  };

  const setCertificadoArchivo = (pid: number, file: File | null) => {
    setCertificados(prev => ({
      ...prev,
      [pid]: { personaId: pid, archivo: file, existente: prev[pid]?.existente || null },
    }));
  };

  const subirCertificados = async (capId: number) => {
    for (const pid of Object.keys(certificados).map(Number)) {
      const cert = certificados[pid];
      if (cert?.archivo) {
        const fd = new FormData();
        fd.append('certificado', cert.archivo);
        await api.post(`/capacitaciones/${capId}/certificado/${pid}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setLoading(true);
    try {
      let capId: number;

      if (esEdicion && decodedId) {
        capId = Number(decodedId);
        const payload: any = {
          nombre: form.nombre,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          horas: parseFloat(form.horas) || 0,
          estado: form.estado,
          persona_ids: personaIds,
        };
        if (form.lugar) payload.lugar = form.lugar;
        if (form.proveedor) payload.proveedor = form.proveedor;
        if (form.observaciones) payload.observaciones = form.observaciones;
        await api.patch(`/capacitaciones/${capId}`, payload);
        toast({ message: 'Capacitación actualizada correctamente' });
      } else {
        const res = await api.post('/capacitaciones', {
          nombre: form.nombre,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          horas: parseFloat(form.horas) || 0,
          estado: form.estado,
          persona_ids: personaIds,
          ...(form.lugar && { lugar: form.lugar }),
          ...(form.proveedor && { proveedor: form.proveedor }),
          ...(form.observaciones && { observaciones: form.observaciones }),
        });
        capId = res.data.id;
        toast({ message: 'Capacitación creada correctamente' });
      }

      await subirCertificados(capId);

      if (personaQueryId) {
        navigate(`/rrhh/personas/${personaQueryId}/capacitaciones-archivos`);
      } else if (esEdicion && id) {
        navigate(`/rrhh/capacitaciones/${id}`);
      } else {
        navigate('/rrhh/capacitaciones');
      }
    } catch (err: any) {
      toast({ message: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const personasFiltradas = personas.filter(p => {
    if (!busquedaPersona.trim()) return true;
    const q = busquedaPersona.toLowerCase();
    return `${p.nombre} ${p.apellidos}`.toLowerCase().includes(q);
  });

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
          <label className="text-xs font-medium text-gray-600">Participantes y certificados</label>
          {personas.length > 0 && (
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busquedaPersona}
              onChange={e => setBusquedaPersona(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          )}
          <div className="border border-gray-300 rounded p-3 max-h-64 overflow-y-auto">
            {personasFiltradas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay personas{busquedaPersona.trim() ? ' que coincidan' : ' registradas'}</p>
            ) : (
              personasFiltradas.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-1.5 px-1 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded">
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={personaIds.includes(p.id)}
                      onChange={() => togglePersona(p.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{p.nombre} {p.apellidos}</span>
                  </label>
                  {personaIds.includes(p.id) && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCertificadoArchivo(p.id, e.target.files?.[0] || null)}
                        className="text-[11px] max-w-[200px] file:mr-2 file:py-0.5 file:px-2 file:rounded-sm file:border file:border-gray-300 file:bg-gray-200 hover:file:bg-gray-300 cursor-pointer"
                      />
                      {certificados[p.id]?.archivo && (
                        <span className="text-[11px] text-gray-500">{certificados[p.id].archivo!.name}</span>
                      )}
                      {!certificados[p.id]?.archivo && certificados[p.id]?.existente && (
                        <a
                          href={buildFileUrl(certificados[p.id].existente!) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Ver certificado
                        </a>
                      )}
                    </div>
                  )}
                </div>
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
