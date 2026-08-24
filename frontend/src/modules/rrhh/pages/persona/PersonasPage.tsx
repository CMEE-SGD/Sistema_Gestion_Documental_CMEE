import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { Persona } from '../../interfaces/persona.interface';
import { Button } from '../../../../shared/components/atoms/button';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import TablaPersonas from '../../components/TablaPersonas';
import { tienePermiso } from '../../../../shared/utils/auth';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const PersonasPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();

    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [palabraClave, setPalabraClave] = useState('');
    // 👇 Filtro ahora usa el Enum o TODOS
    const [filtroEstado, setFiltroEstado] = useState<'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'TODOS'>('ACTIVO');
    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                const response = await api.get('/personas');
                const ordenados = response.data.sort((a: any, b: any) =>
                    (a.apellidos || '').localeCompare(b.apellidos || '')
                );
                setPersonas(ordenados);
            } catch (error) {
                console.error('Error cargando personas', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonas();
    }, []);

    // 👇 Filtrado actualizado al nuevo campo
    const personasFiltradas = personas.filter(persona => {
        if (filtroEstado !== 'TODOS' && persona.estado !== filtroEstado) return false;

        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const nombreCompleto = `${persona.nombre} ${persona.apellidos}`.toLowerCase();
            if (!nombreCompleto.includes(busqueda)) return false;
        }
        return true;
    });

    const handleCheckIndividual = (id: number) => {
        setSeleccionados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleCheckTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSeleccionados(personasFiltradas.map(p => p.id));
        else setSeleccionados([]);
    };

    const handleEliminarSeleccionados = async () => {
        if (seleccionados.length === 0) {
            await alert({ message: "Seleccione al menos un recurso." });
            return;
        }
        const ok = await confirm({ message: `¿Está seguro de que desea enviar a INACTIVO ${seleccionados.length} recurso(s)?` });
        if (!ok) return;

        try {
            await Promise.all(seleccionados.map(id => api.delete(`/personas/${id}`)));
            toast({ message: 'Recursos inhabilitados exitosamente.' });
            window.location.reload();
        } catch (error) {
            await alert({ message: 'Hubo un error al intentar modificar los recursos.' });
        }
    };

    // 👇 NUEVO: Lógica de Exportación de Datos solicitada
    const handleExportarExcel = () => {
        // Armamos el archivo separando columnas con punto y coma para Excel español
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF fuerza codificación UTF-8
        csvContent += "Grado;Apellidos;Nombres;Cedula;Celular 1;Email;Estado\n";

        personasFiltradas.forEach(p => {
            const row = [
                p.grado || '',
                p.apellidos || '',
                p.nombre || '',
                p.cedula_identidad || '',
                p.celular_1 || '',
                p.email_1 || '',
                p.estado || ''
            ].join(";"); // Usamos punto y coma para que Excel lo parta en celdas
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Personal_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4 font-sans bg-white min-h-screen print:bg-white print:m-0">
            <PrintHeader subtitulo="Listado de Personal y Recursos Humanos" filtroAplicado={filtroEstado} />

            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button variant="clasico" onClick={() => navigate('/rrhh')}>Atrás</Button>
                    
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button variant="clasico" onClick={() => navigate('/rrhh/personas/nuevo')}>Nuevo recurso</Button>
                    )}
                    
                    {/* 👇 Botón de exportación agregado */}
                    <Button variant="clasico" onClick={handleExportarExcel}>Exportar CSV</Button>

                    <Button variant="imprimir" />
                    
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button variant="clasico" onClick={handleEliminarSeleccionados} disabled={seleccionados.length === 0}>Eliminar</Button>
                    )}
                    
                    <Button variant="clasico" onClick={() => window.location.reload()}>Actualizar</Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-[11px] font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as any)}
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="ACTIVO">Activos</option>
                            <option value="SUSPENDIDO">Suspendidos</option>
                            <option value="INACTIVO">Inactivos</option>
                            <option value="TODOS">Ver todos</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="palabraClave" className="text-[11px] font-bold text-gray-700">Palabra clave:</label>
                        <input
                            id="palabraClave"
                            type="text"
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] w-48 focus:outline-none focus:border-blue-500"
                            value={palabraClave}
                            onChange={(e) => setPalabraClave(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <TablaPersonas 
                personas={personas}
                personasFiltradas={personasFiltradas}
                loading={loading}
                seleccionados={seleccionados}
                onCheckIndividual={handleCheckIndividual}
                onCheckTodos={handleCheckTodos}
            />
        </div>
    );
};