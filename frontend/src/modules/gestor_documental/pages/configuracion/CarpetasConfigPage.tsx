import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Pencil } from 'lucide-react';
import api from '../../../../core/api/axios';
import { EditCarpetaModal } from '../../components/EditCarpetaModal';

export const CarpetasConfigPage = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [libreriaId, setLibreriaId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchCarpetas = async () => {
    try {
      const res = await api.get('/carpetas');
      const data = Array.isArray(res.data) ? res.data : [];
      setCarpetas(data);

      if (!libreriaId) {
        const libreriasDisp = data.filter((c: any) => c.tipo === 'LIBRERIA').sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
        if (libreriasDisp.length > 0) {
          const primeraLibId = libreriasDisp[0].id;
          setLibreriaId(primeraLibId.toString());
          const areasDisp = data.filter((c: any) => c.tipo === 'AREA' && c.carpeta_padre_id === primeraLibId).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
          if (areasDisp.length > 0) setAreaId(areasDisp[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error al cargar carpetas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarpetas(); }, []);

  const handleLibreriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLibId = e.target.value;
    setLibreriaId(newLibId);
    const areasDeEstaLib = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(newLibId)).sort((a, b) => (a.orden || 0) - (b.orden || 0));
    setAreaId(areasDeEstaLib.length > 0 ? areasDeEstaLib[0].id.toString() : '');
  };

  const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA').sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const areas = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(libreriaId)).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const libSeleccionada = librerias.find(l => l.id.toString() === libreriaId);
  const areaSeleccionada = areas.find(a => a.id.toString() === areaId);

  const obtenerSubcarpetasAnidadas = (parentId: number, depth: number = 0): any[] => {
    const hijos = carpetas.filter(c => c.carpeta_padre_id === parentId).sort((a, b) => (a.orden || 0) - (b.orden || 0));
    let resultado: any[] = [];
    hijos.forEach(hijo => {
      resultado.push({ ...hijo, depth });
      resultado = resultado.concat(obtenerSubcarpetasAnidadas(hijo.id, depth + 1));
    });
    return resultado;
  };

  const estructuraPlana = areaId ? obtenerSubcarpetasAnidadas(Number(areaId)) : [];

  return (
    <div className="bg-white">
      <h2 className="text-[16px] font-bold text-gray-800 mb-6">
        Administración de carpetas de {areaSeleccionada?.nombre || '...'} de {libSeleccionada?.nombre || '...'}
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={libreriaId} onChange={handleLibreriaChange} className="border border-gray-300 rounded px-3 py-1.5 min-w-[250px] outline-none focus:border-blue-500 text-sm">
          {librerias.length === 0 && <option value="">-- No hay librerías --</option>}
          {librerias.map(lib => <option key={lib.id} value={lib.id}>{lib.nombre}</option>)}
        </select>
        <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={!libreriaId} className="border border-gray-300 rounded px-3 py-1.5 min-w-[250px] outline-none focus:border-blue-500 text-sm disabled:bg-gray-100">
          {areas.length === 0 && <option value="">-- No hay áreas --</option>}
          {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <button disabled={!areaId} onClick={() => navigate('/gestordocumental/nueva-carpeta', { state: { carpetaPadreId: areaId, carpetaPadreNombre: areaSeleccionada?.nombre } })} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
          Carpeta nueva
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 p-4">Cargando estructura de carpetas...</div>
      ) : !areaId ? (
        <div className="text-center py-10 text-gray-500 italic border-2 border-dashed border-gray-200 rounded-lg">
          Seleccione una Librería y un Área para ver sus carpetas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 border-collapse">
            <thead className="bg-[#006400] text-white font-bold">
              <tr>
                <th className="px-3 py-2 border-r border-[#004d00]">Nombre ▼</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-32">Código</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-32">Categoría</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Estado</th>
                <th className="px-3 py-2 text-center w-48">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estructuraPlana.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">
                    Esta área está vacía.
                  </td>
                </tr>
              ) : (
                estructuraPlana.map((carpeta, idx) => (
                  <tr key={carpeta.id} className={`border-b border-gray-200 transition-colors ${idx === estructuraPlana.length - 1 ? 'border-b-[4px] border-b-[#006400]' : ''} even:bg-gray-100 odd:bg-white hover:bg-gray-200`}>
                    <td className="px-3 py-1.5">
                      <div style={{ marginLeft: `${carpeta.depth * 20}px` }} className="flex items-center gap-2">
                        {carpeta.depth > 0 && <span className="text-gray-400 tracking-tighter">└─</span>}
                        <Folder className="w-3.5 h-3.5 text-gray-800 fill-current shrink-0" />
                        <span className="font-medium">{carpeta.nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center">{carpeta.codigo || '-'}</td>
                    <td className="px-3 py-1.5 text-center">Sin categoría</td>
                    <td className="px-3 py-1.5 text-center">{carpeta.activo ? 'Activa' : 'Inactiva'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditId(carpeta.id)} className="px-2 py-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => navigate('/gestordocumental/nueva-carpeta', { state: { carpetaPadreId: carpeta.id, carpetaPadreNombre: carpeta.nombre } })} className="px-2 py-1 text-[11px] text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                          Nueva subcarpeta
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editId && <EditCarpetaModal carpetaId={editId} onClose={() => setEditId(null)} onSaved={() => { setEditId(null); fetchCarpetas(); }} />}
    </div>
  );
};
