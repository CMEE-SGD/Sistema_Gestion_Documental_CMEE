-- Interruptor para exigir en el servidor el motivo al editar o eliminar.
-- NOT NULL con DEFAULT true: en PostgreSQL (11+) agregar una columna con un
-- valor por defecto constante es instantáneo y no reescribe la tabla; la fila
-- de configuración existente queda con la exigencia activa.
ALTER TABLE "configuracion_general" ADD COLUMN "exigir_motivo_cambios" BOOLEAN NOT NULL DEFAULT true;
