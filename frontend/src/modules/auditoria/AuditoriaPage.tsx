import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw, Filter as FilterIcon, KeyRound } from 'lucide-react';
import api from '../../core/api/axios';
import { TablaHistorial } from '../../shared/components/organisms/TablaHistorial';
import { TablaIntentosLogin } from '../../shared/components/organisms/TablaIntentosLogin';
import Navbar from '../../shared/components/organisms/Navbar'; // 👇 Importamos el Navbar

const MODULOS: { value: string; label: string }[] = [
    { value: '', label: 'Todos los módulos' },
    { value: 'RECEPCION-EQUIPOS', label: 'Recepción de Equipos' },
    { value: 'CERTIFICADOS', label: 'Certificados' },
    { value: 'CLIENTES-INSTITUCIONALES', label: 'Clientes Institucionales' },
    { value: 'PERSONAS', label: 'Personas' },
    { value: 'USUARIOS', label: 'Usuarios' },
    { value: 'ROLES', label: 'Roles' },
    { value: 'PUESTOS', label: 'Puestos' },
    { value: 'GRUPOS', label: 'Grupos' },
    { value: 'LABORATORIOS', label: 'Laboratorios' },
    { value: 'EQUIPOS', label: 'Equipos' },
    { value: 'SERVICIOS', label: 'Servicios' },
    { value: 'DOCUMENTOS', label: 'Documentos' },
    { value: 'CARPETAS', label: 'Carpetas' },
    { value: 'CIRCUITOS', label: 'Circuitos' },
    { value: 'DEPARTAMENTOS', label: 'Departamentos' },
    { value: 'APLICACIONES', label: 'Aplicaciones' },
    { value: 'REPORTES', label: 'Reportes' },
    { value: 'AUDITORIA', label: 'Auditoría' },
    { value: 'NOTIFICACIONES', label: 'Notificaciones' },
    { value: 'PERSONA-PUESTO', label: 'Asignación de Puestos' },
];

const ACCIONES: { value: string; label: string }[] = [
    { value: '', label: 'Todas las acciones' },
    { value: 'Consulta', label: 'Consulta' },
    { value: 'Creación', label: 'Creación' },
    { value: 'Edición', label: 'Edición' },
    { value: 'Eliminación', label: 'Eliminación' },
];

const inputClass =
    'text-[11px] border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500';

export const AuditoriaPage = () => {
    const navigate = useNavigate();
    const [vista, setVista] = useState<'general' | 'login'>('general');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros — bitácora general
    const [modulo, setModulo] = useState('');
    const [entidadId, setEntidadId] = useState('');
    const [accion, setAccion] = useState('');
    const [usuario, setUsuario] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    // Paginación de servidor — bitácora general
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [total, setTotal] = useState(0);

    // Filtros y estado — intentos de inicio de sesión
    const [intentos, setIntentos] = useState([]);
    const [loadingLogin, setLoadingLogin] = useState(true);
    const [usuarioLogin, setUsuarioLogin] = useState('');
    const [exitoLogin, setExitoLogin] = useState('');
    const [desdeLogin, setDesdeLogin] = useState('');
    const [hastaLogin, setHastaLogin] = useState('');
    const [paginaLogin, setPaginaLogin] = useState(1);
    const [totalPaginasLogin, setTotalPaginasLogin] = useState(1);
    const [totalLogin, setTotalLogin] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/auditoria', {
                params: {
                    modulo: modulo || undefined,
                    entidadId: entidadId.trim() || undefined,
                    accion: accion || undefined,
                    usuario: usuario.trim() || undefined,
                    desde: desde || undefined,
                    hasta: hasta || undefined,
                    pagina,
                    porPagina: 20,
                },
            });
            setLogs(response.data.data);
            setTotalPaginas(response.data.totalPaginas);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error cargando la auditoría', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagina]);

    const aplicarFiltros = () => {
        setPagina(1);
        fetchLogs();
    };

    const limpiarFiltros = () => {
        setModulo('');
        setEntidadId('');
        setAccion('');
        setUsuario('');
        setDesde('');
        setHasta('');
        setPagina(1);
    };

    const fetchIntentosLogin = async () => {
        setLoadingLogin(true);
        try {
            const response = await api.get('/auditoria/intentos-login', {
                params: {
                    usuario: usuarioLogin.trim() || undefined,
                    exito: exitoLogin || undefined,
                    desde: desdeLogin || undefined,
                    hasta: hastaLogin || undefined,
                    pagina: paginaLogin,
                    porPagina: 20,
                },
            });
            setIntentos(response.data.data);
            setTotalPaginasLogin(response.data.totalPaginas);
            setTotalLogin(response.data.total);
        } catch (error) {
            console.error('Error cargando los intentos de inicio de sesión', error);
        } finally {
            setLoadingLogin(false);
        }
    };

    useEffect(() => {
        if (vista === 'login') fetchIntentosLogin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vista, paginaLogin]);

    const aplicarFiltrosLogin = () => {
        setPaginaLogin(1);
        fetchIntentosLogin();
    };

    const limpiarFiltrosLogin = () => {
        setUsuarioLogin('');
        setExitoLogin('');
        setDesdeLogin('');
        setHastaLogin('');
        setPaginaLogin(1);
    };

    return (
        <div className="flex flex-col bg-gray-100 min-h-screen font-sans">
            {/* 👇 Añadimos el Navbar en la parte superior */}
            <Navbar />

            <div className="flex flex-col bg-white flex-grow m-4 shadow-sm border border-gray-200 rounded">
                {/* Cabecera */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h1 className="text-sm font-bold text-gray-800">
                        Bitácora de Accesos y Auditoría Global
                    </h1>
                </div>

                {/* Barra de herramientas */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-300 bg-gray-50">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        <ArrowLeft className="w-3 h-3" /> Atrás
                    </button>
                    <button
                        onClick={() => (vista === 'general' ? fetchLogs() : fetchIntentosLogin())}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        <RefreshCw className="w-3 h-3" /> Actualizar Listado
                    </button>

                    <div className="flex gap-1 ml-2">
                        <button
                            onClick={() => setVista('general')}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded border shadow-sm ${vista === 'general' ? 'bg-[#006400] text-white border-[#004d00]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                        >
                            <ShieldAlert className="w-3 h-3" /> Bitácora General
                        </button>
                        <button
                            onClick={() => setVista('login')}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded border shadow-sm ${vista === 'login' ? 'bg-[#006400] text-white border-[#004d00]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                        >
                            <KeyRound className="w-3 h-3" /> Intentos de Inicio de Sesión
                        </button>
                    </div>
                </div>

                {/* Filtros — Bitácora General */}
                {vista === 'general' && (
                <div className="flex flex-wrap items-end gap-2 px-4 py-3 border-b border-gray-300 bg-gray-50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mr-1">
                        <FilterIcon className="w-3.5 h-3.5" />
                        Filtros
                    </div>

                    <select
                        value={modulo}
                        onChange={(e) => setModulo(e.target.value)}
                        className={inputClass}
                    >
                        {MODULOS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="ID de entidad..."
                        value={entidadId}
                        onChange={(e) => setEntidadId(e.target.value)}
                        className={`${inputClass} w-32`}
                    />

                    <select
                        value={accion}
                        onChange={(e) => setAccion(e.target.value)}
                        className={inputClass}
                    >
                        {ACCIONES.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Usuario..."
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className={inputClass}
                    />

                    <label className="flex items-center gap-1 text-[10px] text-gray-500">
                        Desde
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <label className="flex items-center gap-1 text-[10px] text-gray-500">
                        Hasta
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <button
                        onClick={aplicarFiltros}
                        className="px-3 py-1.5 text-[11px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                    >
                        Aplicar
                    </button>
                    <button
                        onClick={limpiarFiltros}
                        className="px-3 py-1.5 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        Limpiar
                    </button>
                </div>
                )}

                {/* Filtros — Intentos de Inicio de Sesión */}
                {vista === 'login' && (
                <div className="flex flex-wrap items-end gap-2 px-4 py-3 border-b border-gray-300 bg-gray-50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 mr-1">
                        <FilterIcon className="w-3.5 h-3.5" />
                        Filtros
                    </div>

                    <input
                        type="text"
                        placeholder="Usuario intentado..."
                        value={usuarioLogin}
                        onChange={(e) => setUsuarioLogin(e.target.value)}
                        className={inputClass}
                    />

                    <select
                        value={exitoLogin}
                        onChange={(e) => setExitoLogin(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Todos los resultados</option>
                        <option value="true">Exitosos</option>
                        <option value="false">Fallidos</option>
                    </select>

                    <label className="flex items-center gap-1 text-[10px] text-gray-500">
                        Desde
                        <input
                            type="date"
                            value={desdeLogin}
                            onChange={(e) => setDesdeLogin(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <label className="flex items-center gap-1 text-[10px] text-gray-500">
                        Hasta
                        <input
                            type="date"
                            value={hastaLogin}
                            onChange={(e) => setHastaLogin(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <button
                        onClick={aplicarFiltrosLogin}
                        className="px-3 py-1.5 text-[11px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                    >
                        Aplicar
                    </button>
                    <button
                        onClick={limpiarFiltrosLogin}
                        className="px-3 py-1.5 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        Limpiar
                    </button>
                </div>
                )}

                {/* Inyección del componente reutilizable */}
                <div className="p-4">
                    {vista === 'general' ? (
                        <TablaHistorial
                            logs={logs}
                            loading={loading}
                            esGlobal={true}
                            paginacionServidor={{
                                paginaActual: pagina,
                                totalPaginas,
                                total,
                                onCambiarPagina: setPagina,
                            }}
                        />
                    ) : (
                        <TablaIntentosLogin
                            intentos={intentos}
                            loading={loadingLogin}
                            paginacionServidor={{
                                paginaActual: paginaLogin,
                                totalPaginas: totalPaginasLogin,
                                total: totalLogin,
                                onCambiarPagina: setPaginaLogin,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
