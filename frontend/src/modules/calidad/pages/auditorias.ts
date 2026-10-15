// Catálogo de motivos de auditoría adicional (MC22 22.5.2).
// El área técnica complementa las auditorías del programa cuando se produce
// alguna de estas tres circunstancias. En la BD se guarda el valor; la etiqueta
// es la que se muestra al usuario.
export const MOTIVOS_AUDITORIA_ADICIONAL = [
    {
        value: 'CAMBIO_SIGNIFICATIVO_SGC',
        label: 'Cambio significativo en el Sistema de Gestión de la Calidad',
        descripcion: 'Se introdujeron cambios en el SGC y se necesita evaluar su impacto.',
    },
    {
        value: 'SOSPECHA_INCUMPLIMIENTO',
        label: 'Sospecha o certeza de incumplimiento',
        descripcion: 'Se sospecha o se tiene certeza de que no se cumplen los requisitos de calidad establecidos.',
    },
    {
        value: 'IMPLANTACION_AC_EFFICACIDAD',
        label: 'Eficacia de una acción correctiva no demostrada',
        descripcion: 'La implantación de la acción correctiva puede no ser eficaz y hay que comprobarlo.',
    },
];

/** Etiqueta legible de un motivo de auditoría adicional. Si el valor no está
 * catalogado (datos previos a una versión nueva), lo devuelve tal cual. */
export function nombreMotivoAdicional(valor?: string | null): string {
    if (!valor) return '—';
    return MOTIVOS_AUDITORIA_ADICIONAL.find(m => m.value === valor)?.label || valor;
}