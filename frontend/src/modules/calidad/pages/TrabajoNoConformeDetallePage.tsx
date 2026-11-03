import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { tienePermiso } from '../../../shared/utils/auth';
import { encodeId, decodeId } from '../../../shared/utils/ids';
import {
    ESTADO_LABEL,
    ESTADO_STYLES,
    etiquetaCategoria,
    etiquetasAcciones,
    formatearFecha,
} from './trabajosNoConformes';

const Campo = ({ label, valor, ancho = '' }: { label: string; valor?: React.ReactNode; ancho?: string }) => (
    <div className={ancho}>
        <span className="font-semibold text-gray-700">{label}:</span>{' '}
        <span className="text-gray-600">{valor ?? '—'}</span>
    </div>
);

const bloque = 'grid grid-cols-1 md:grid-cols-3 gap-3 text-sm border border-t-0 border-gray-300 rounded-b p-4';

export const TrabajoNoConformeDetallePage = () => {
    const { id: rawId } = useParams<{ id: string }>();
    const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert } = useAlert();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const puedeEditar = tienePermiso('Gestion de Calidad', 4);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/trabajos-no-conformes/${id}`);
                setItem(res.data);
            } catch {
                await alert({ message: 'No se pudo cargar el registro.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    if (loading) return <div className="text-center py-10 text-gray-400">Cargando...</div>;
    if (!item) return <div className="text-center py-10 text-gray-400">Registro no encontrado</div>;

    const acciones = etiquetasAcciones(item.acciones_tomadas);

    return (
        <div>
            <button
                onClick={() => navigate('/calidad/trabajos-no-conformes')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a Trabajos No Conformes
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Encabezado del formulario */}
                <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="text-center mb-2">
                        <div className="text-sm font-bold text-gray-800">CENTRO DE METROLOGÍA DEL EJÉRCITO</div>
                        <div className="text-xs font-semibold text-gray-600">DEPARTAMENTO DE CALIDAD</div>
                        <div className="text-sm font-bold text-gray-800 mt-1">
                            REGISTRO Y CONTROL DE TRABAJOS DE ENSAYOS Y/O CALIBRACIÓN NO CONFORMES
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Código de documento: GD4.1.F1-1</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <h2 className="font-mono font-bold text-gray-800">{item.codigo}</h2>
                            <span
                                className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${ESTADO_STYLES[item.estado] || 'bg-gray-100 text-gray-500'}`}
                            >
                                {ESTADO_LABEL[item.estado] || item.estado}
                            </span>
                        </div>
                        {puedeEditar && (
                            <Button
                                variant="default"
                                onClick={() => navigate(`/calidad/trabajos-no-conformes/editar/${encodeId(item.id)}`)}
                            >
                                <Edit3 className="w-4 h-4 mr-1" /> Editar
                            </Button>
                        )}
                    </div>
                </div>

                {/* 1. DESCRIPCIÓN */}
                <div className="p-4">
                    <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">
                        1. DESCRIPCIÓN DEL ENSAYO Y/O CALIBRACIÓN NO CONFORME
                    </div>
                    <div className={bloque}>
                        <Campo label="Elaborado / Detectado por" valor={item.elaborado_por} />
                        <Campo label="Fecha de detección" valor={formatearFecha(item.fecha)} />
                        <Campo label="Categoría" valor={etiquetaCategoria(item.categoria)} />
                        <div className="md:col-span-3">
                            <span className="font-semibold text-gray-700">Descripción del problema:</span>
                            <p className="text-gray-600 whitespace-pre-wrap mt-1">{item.descripcion_problema}</p>
                        </div>
                    </div>
                </div>

                {/* 2. TRATAMIENTO */}
                <div className="p-4 pt-0">
                    <div className="bg-amber-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
                        2. TRATAMIENTO DEL ENSAYO Y/O CALIBRACIÓN NO CONFORME
                    </div>
                    <div className={bloque}>
                        <Campo label="Responsable" valor={item.tratamiento_responsable} />
                        <Campo label="Fecha" valor={formatearFecha(item.tratamiento_fecha)} />
                        <Campo
                            label="Acciones tomadas"
                            valor={
                                acciones.length ? (
                                    <span className="inline-flex flex-wrap gap-1 align-middle">
                                        {acciones.map((a) => (
                                            <span key={a} className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                                                {a}
                                            </span>
                                        ))}
                                    </span>
                                ) : (
                                    '—'
                                )
                            }
                        />
                        <div className="md:col-span-3">
                            <span className="font-semibold text-gray-700">Descripción del tratamiento:</span>
                            <p className="text-gray-600 whitespace-pre-wrap mt-1">{item.tratamiento_descripcion || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* 3. ACCIÓN CORRECTIVA / PREVENTIVA */}
                <div className="p-4 pt-0">
                    <div className="bg-blue-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
                        3. REQUIERE ACCIÓN CORRECTIVA / PREVENTIVA
                    </div>
                    <div className={bloque}>
                        <Campo label="¿Requiere acción correctiva?" valor={item.requiere_accion_correctiva ? 'Sí' : 'No'} />
                        <Campo label="N° acción correctiva" valor={item.accion_correctiva_num} />
                        <Campo label="¿Requiere acción preventiva?" valor={item.requiere_accion_preventiva ? 'Sí' : 'No'} />
                        <Campo label="N° acción preventiva" valor={item.accion_preventiva_num} />
                    </div>
                </div>

                {/* 4. SEGUIMIENTO */}
                <div className="p-4 pt-0">
                    <div className="bg-emerald-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
                        4. SEGUIMIENTO
                    </div>
                    <div className={bloque}>
                        <Campo label="Responsable" valor={item.seguimiento_responsable} />
                        <Campo label="Fecha" valor={formatearFecha(item.seguimiento_fecha)} />
                        <Campo
                            label="¿Eficaz?"
                            valor={
                                item.eficaz === true ? 'Sí' : item.eficaz === false ? 'No' : 'Pendiente'
                            }
                        />
                        <div className="md:col-span-3">
                            <span className="font-semibold text-gray-700">Eficacia verificada:</span>
                            <p className="text-gray-600 whitespace-pre-wrap mt-1">{item.eficacia_verificada || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* 5. OBSERVACIONES Y CIERRE */}
                <div className="p-4 pt-0">
                    <div className="bg-gray-600 text-white px-3 py-2 text-sm font-semibold rounded-t">
                        5. OBSERVACIONES Y CIERRE
                    </div>
                    <div className={bloque}>
                        <div className="md:col-span-3">
                            <span className="font-semibold text-gray-700">Observaciones:</span>
                            <p className="text-gray-600 whitespace-pre-wrap mt-1">{item.observaciones || '—'}</p>
                        </div>
                        <Campo label="Nombre" valor={item.cerrado_por} />
                        <Campo label="Fecha de cierre" valor={formatearFecha(item.fecha_cierre)} />
                    </div>
                </div>
            </div>
        </div>
    );
};
