import { useState, useEffect } from 'react';
import { ClipboardList, Eye } from 'lucide-react';
import api from '../../../core/api/axios';
import { getUsuarioActual } from '../../../shared/hooks/useAuth';
import { Modal } from '../../../shared/components/molecules/Modal';
import { Button } from '../../../shared/components/atoms/button';

const ESTADO_BADGES: Record<string, string> = {
  EN_ESPERA: 'bg-yellow-100 text-yellow-800',
  EN_CALIBRACION: 'bg-blue-100 text-blue-800',
  FINALIZADO: 'bg-green-100 text-green-800',
};

function estadoBadge(estado: string) {
  const colors = ESTADO_BADGES[estado] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors}`}>
      {estado.replace(/_/g, ' ')}
    </span>
  );
}

function viewTitle(puesto: string): string {
  if (puesto === 'Jefe de Departamento Técnico') return 'Visión Global — Todos los equipos';
  if (puesto === 'Observador Técnico') return 'Bandeja del Laboratorio — Equipos pendientes de asignación';
  if (puesto === 'Director del CMEE') return 'Dashboard Directivo — Todos los equipos (solo lectura)';
  return 'Mis Equipos — Equipos asignados para calibración';
}

function isReadOnly(puesto: string): boolean {
  return puesto === 'Director del CMEE';
}

export default function BandejaTrabajoPage() {
  const user = getUsuarioActual();
  const puesto = user?.persona?.puesto || '';
  const personaId = user?.persona_id;

  const [recepciones, setRecepciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // OBT: assign-technician modal
  const [asignarModal, setAsignarModal] = useState<{ open: boolean; recepcionId: number }>({ open: false, recepcionId: 0 });
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number | null>(null);
  const [asignando, setAsignando] = useState(false);

  // Resolve which endpoint to call
  const getEndpoint = async (): Promise<string> => {
    if (puesto === 'Jefe de Departamento Técnico' || puesto === 'Director del CMEE') {
      return '/recepcion-equipos';
    }
    if (puesto === 'Observador Técnico') {
      const raw = localStorage.getItem('usuario');
      let labId: number | null = null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          labId = (parsed as any).laboratorio_id ?? null;
        } catch { /* ignore */ }
      }
      if (!labId) {
        // Fallback: look up the lab where this person is responsable
        try {
          const labs = await api.get('/laboratorios').then(r => r.data);
          const match = labs.find((l: any) => l.responsable_id === personaId);
          labId = match?.id ?? null;
        } catch { /* ignore */ }
      }
      if (!labId) throw new Error('No se pudo determinar su laboratorio. Contacte al administrador.');
      return `/recepcion-equipos/laboratorio/${labId}/pendientes`;
    }
    // Técnico
    return `/recepcion-equipos/tecnico/${personaId}/pendientes`;
  };

  const fetchData = async () => {
    if (!puesto) return;
    setIsLoading(true);
    setError('');
    try {
      const endpoint = await getEndpoint();
      const res = await api.get(endpoint);
      setRecepciones(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [puesto]);

  const openAsignarModal = async (recepcionId: number) => {
    setAsignarModal({ open: true, recepcionId });
    setSelectedTecnicoId(null);
    if (personas.length === 0) {
      try {
        const res = await api.get('/personas');
        setPersonas(res.data);
      } catch { /* ignore */ }
    }
  };

  const handleAsignar = async () => {
    if (!selectedTecnicoId) return;
    setAsignando(true);
    try {
      await api.patch(`/recepcion-equipos/${asignarModal.recepcionId}/asignar-tecnico`, {
        tecnico_id: selectedTecnicoId,
      });
      setAsignarModal({ open: false, recepcionId: 0 });
      setSelectedTecnicoId(null);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al asignar técnico');
    } finally {
      setAsignando(false);
    }
  };

  if (!puesto) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-semibold">No se pudo determinar su puesto de trabajo.</p>
          <p className="text-yellow-600 text-sm mt-1">Consulte con el administrador del sistema.</p>
        </div>
      </div>
    );
  }

  const readonly = isReadOnly(puesto);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bandeja de Trabajo</h1>
          <p className="text-sm text-gray-500 mt-0.5">{viewTitle(puesto)}</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* READ-ONLY BANNER */}
      {readonly && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Vista de solo lectura — no puede realizar acciones sobre los registros.
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-blue-200 border-b-2 border-blue-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Orden Física</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Laboratorio</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Técnico</th>
              {!readonly && <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Acción</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={readonly ? 7 : 8} className="text-center py-8 text-gray-500">Cargando...</td></tr>
            ) : recepciones.length === 0 ? (
              <tr><td colSpan={readonly ? 7 : 8} className="text-center py-8 text-gray-500">No hay registros pendientes.</td></tr>
            ) : (
              recepciones.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <span className="text-red-600 font-bold">#{req.orden_trabajo_fisica}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(req.fecha_ingreso).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.cliente?.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.equipo_descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.laboratorio?.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{estadoBadge(req.estado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {req.tecnico ? `${req.tecnico.nombre} ${req.tecnico.apellidos}` : <span className="text-gray-400 italic">Sin asignar</span>}
                  </td>
                  {!readonly && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {puesto === 'Observador Técnico' && (
                        <Button variant="outline" size="sm" onClick={() => openAsignarModal(req.id)}>
                          Asignar
                        </Button>
                      )}
                      {puesto !== 'Observador Técnico' && puesto !== 'Jefe de Departamento Técnico' && (
                        <Button variant="default" size="sm" onClick={() => alert('Iniciar calibración — funcionalidad próxima')}>
                          Iniciar Calibración
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN TECHNICIAN MODAL (OBT only) */}
      <Modal
        isOpen={asignarModal.open}
        onClose={() => { setAsignarModal({ open: false, recepcionId: 0 }); setSelectedTecnicoId(null); }}
        title="Asignar Técnico"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Seleccione el técnico que realizará la calibración del equipo.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
            <select
              className="block w-full border border-gray-300 rounded-md p-2 text-sm"
              value={selectedTecnicoId ?? ''}
              onChange={(e) => setSelectedTecnicoId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Seleccione un técnico...</option>
              {personas.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.grado ? `${p.grado} ` : ''}{p.nombre} {p.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => { setAsignarModal({ open: false, recepcionId: 0 }); setSelectedTecnicoId(null); }}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              disabled={!selectedTecnicoId || asignando}
              onClick={handleAsignar}
            >
              {asignando ? 'Asignando...' : 'Asignar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
