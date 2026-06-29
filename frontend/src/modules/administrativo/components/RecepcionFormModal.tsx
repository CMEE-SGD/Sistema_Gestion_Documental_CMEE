import { useState, useEffect } from 'react';
import api from '../../../core/api/axios'; 

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecepcionFormModal({ onClose, onSuccess }: Props) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [laboratorios, setLaboratorios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ nombre: '', tipo: 'CIVIL' });

  const [formData, setFormData] = useState({
    orden_trabajo_fisica: '',
    cliente_id: '',
    equipo_descripcion: '',
    codigo_serie: '',
    laboratorio_id: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/clientes-institucionales'),
      api.get('/laboratorios')
    ]).then(([resClientes, resLabs]) => {
      setClientes(resClientes.data);
      setLaboratorios(resLabs.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalClienteId = formData.cliente_id;

      if (isNewClient) {
        if (!newClientData.nombre) {
          alert('Por favor ingrese el nombre del nuevo cliente');
          setIsLoading(false);
          return;
        }
        const clientRes = await api.post('/clientes-institucionales', {
          nombre: newClientData.nombre,
          tipo: newClientData.tipo,
          activo: true
        });
        finalClienteId = clientRes.data.id;
      }

      await api.post('/recepcion-equipos', {
        orden_trabajo_fisica: formData.orden_trabajo_fisica,
        cliente_id: Number(finalClienteId),
        equipo_descripcion: formData.equipo_descripcion,
        codigo_serie: formData.codigo_serie || null,
        laboratorio_id: Number(formData.laboratorio_id)
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(error.response?.data?.message || 'Error al guardar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Registro Rápido de Recepción</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nº Orden Física (Rojo)</label>
              <input type="text" name="orden_trabajo_fisica" required className="mt-1 block w-full border border-red-300 rounded-md shadow-sm p-2 font-bold text-red-600" value={formData.orden_trabajo_fisica} onChange={handleChange} />
            </div>

            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Cliente / Unidad</label>
                <button type="button" onClick={() => setIsNewClient(!isNewClient)} className="text-xs text-blue-600 font-semibold hover:underline">
                  {isNewClient ? "Cancelar" : "✚ Nuevo Cliente"}
                </button>
              </div>

              {!isNewClient ? (
                <select name="cliente_id" required={!isNewClient} className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.cliente_id} onChange={handleChange}>
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map((c: any) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input type="text" placeholder="Nombre" required={isNewClient} className="block w-full border border-blue-400 rounded-md p-2 bg-blue-50" value={newClientData.nombre} onChange={(e) => setNewClientData({...newClientData, nombre: e.target.value})} />
                  <select className="block w-full border border-gray-300 rounded-md p-2" value={newClientData.tipo} onChange={(e) => setNewClientData({...newClientData, tipo: e.target.value})}>
                    <option value="CIVIL">Cliente Civil / Empresa</option>
                    <option value="MILITAR">Unidad Militar</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción del Equipo</label>
              <input type="text" name="equipo_descripcion" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.equipo_descripcion} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Laboratorio Destino</label>
              <select name="laboratorio_id" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.laboratorio_id} onChange={handleChange}>
                <option value="">Seleccione el laboratorio...</option>
                {laboratorios.map((l: any) => (<option key={l.id} value={l.id}>{l.nombre}</option>))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isLoading ? 'Guardando...' : 'Guardar Registro'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}