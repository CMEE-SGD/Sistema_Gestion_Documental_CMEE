import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import VistaGrupos from '../../components/VistaGrupos';
import { tienePermiso } from '../../../../shared/utils/auth'; // 👇 Importamos auth

export const GruposPage = () => {
    const navigate = useNavigate();
    const [departamentos, setDepartamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');
    const [vistaActual, setVistaActual] = useState<'tabla' | 'organigrama'>('tabla');
    const [verPersonal, setVerPersonal] = useState(true);
    const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | 'todos'>('todos');

    useEffect(() => {
        const cargarDepartamentos = async () => {
            try {
                const res = await api.get('/departamentos');
                setDepartamentos(construirArbol(res.data));
            } finally { setLoading(false); }
        };
        cargarDepartamentos();
    }, []);

    const construirArbol = (data: any[], padreId: number | null = null, nivel: number = 0): any[] => {
        let resultado: any[] = [];
        data.filter(d => d.dependencia_id === padreId).sort((a,b) => (a.orden||0)-(b.orden||0)).forEach(hijo => {
            resultado.push({ ...hijo, nivel });
            resultado = resultado.concat(construirArbol(data, hijo.id, nivel + 1));
        });
        return resultado;
    };

    const gruposFiltrados = departamentos.filter(dep => {
        if (filtroEstado === 'activo' && !dep.activo) return false;
        if (filtroEstado === 'inactivo' && dep.activo) return false;
        if (palabraClave && !`${dep.nombre} ${dep.codigo}`.toLowerCase().includes(palabraClave.toLowerCase())) return false;
        return true; 
    });

    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">
            <PrintHeader subtitulo={vistaActual === 'tabla' ? 'Listado de Grupos' : 'Organigrama'} filtroAplicado={vistaActual === 'tabla' ? filtroEstado : undefined} />

            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded border border-gray-200 print:hidden">
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/rrhh')} variant="clasico">Atrás</Button>
                    
                    {/* 👇 Ocultamos creación de nuevo grupo/departamento (Nivel 5) */}
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button onClick={() => navigate('/rrhh/grupos/nuevo')} variant="clasico">
                            <Plus className="w-4 h-4" /> Nuevo
                        </Button>
                    )}
                    
                    <Button onClick={() => setVistaActual(v => v === 'tabla' ? 'organigrama' : 'tabla')} variant="clasico">
                        {vistaActual === 'tabla' ? 'Organigrama' : 'Tabla'}
                    </Button>
                    <Button variant="imprimir" />
                </div>
                {vistaActual === 'tabla' ? (
                    <div className="flex items-center gap-4">
                        <select value={filtroEstado} onChange={(e: any) => setFiltroEstado(e.target.value)} className="p-1.5 text-sm border border-gray-300 rounded">
                            <option value="activo">Activos</option><option value="inactivo">Inactivos</option><option value="todos">Todos</option>
                        </select>
                        <input placeholder="Buscar..." className="border rounded px-2 py-1.5 text-sm" value={palabraClave} onChange={(e) => setPalabraClave(e.target.value)} />
                    </div>
                ) : (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={verPersonal} onChange={(e) => setVerPersonal(e.target.checked)} /> Ver personal
                    </label>
                )}
            </div>

            <VistaGrupos vistaActual={vistaActual} gruposFiltrados={gruposFiltrados} loading={loading} verPersonal={verPersonal} />
        </div>
    );
};