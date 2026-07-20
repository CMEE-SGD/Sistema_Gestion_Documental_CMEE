// Clase de error separada de firmarPdf.ts a propósito: ese módulo importa
// las librerías de firma digital (~350KB), pesadas para cargar en el bundle
// principal. Este archivo, sin dependencias, se puede importar de forma
// estática donde haga falta comprobar `instanceof FirmaPdfError` sin forzar
// la carga anticipada de esas librerías.
export class FirmaPdfError extends Error {}
