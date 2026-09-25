// Catálogo de procesos del módulo de Calidad (riesgos y oportunidades).
// En la BD se guarda el valor (sigla/código); la etiqueta es la que se
// muestra al usuario.
export const PROCESOS = [
    { value: 'DCM', label: 'Direccionamiento Operativo (DCM)' },
    { value: 'JDT_CALIBRACION', label: 'Calibración y Caracterización (JDT)' },
    { value: 'JDT_EQUIPOS', label: 'Gestión Equipos y Patrones (JDT)' },
    { value: 'RSEC_RECEPCION', label: 'Recepción (RSEC)' },
    { value: 'RSEC_ENTREGA_FACTURACION', label: 'Entrega y Facturación (RSEC)' },
    { value: 'JDC_DESEMPENO', label: 'Desempeño Organizacional (JDC)' },
    { value: 'JDC_IMPARCIALIDAD', label: 'Imparcialidad (JDC)' },
    { value: 'JDA', label: 'Gestión Administrativa (JDA)' },
];

/** Devuelve el nombre legible y completo de un proceso a partir de su valor en BD,
 * sin las siglas/código (p. ej. "Imparcialidad" en vez de "Imparcialidad (JDC)").
 * Si el valor no está catalogado, lo devuelve tal cual. */
export function nombreProceso(valor?: string | null): string {
    if (!valor) return '—';
    const encontrado = PROCESOS.find(p => p.value === valor);
    if (encontrado) {
        return encontrado.label.replace(/\s*\([^)]*\)\s*$/, '');
    }
    return valor;
}