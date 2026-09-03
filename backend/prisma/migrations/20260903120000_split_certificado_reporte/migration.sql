-- Certificado pasa de tener un solo archivo/firma compartida a dos
-- documentos independientes (reporte, certificado) con firmantes propios.
-- No hay datos reales de certificados en producción todavía, así que se
-- limpian las filas de prueba en vez de migrar una sola columna a dos.
DELETE FROM "firma_digital";
DELETE FROM "certificado";

ALTER TABLE "certificado"
  DROP COLUMN "ruta_archivo",
  DROP COLUMN "nombre_original",
  ADD COLUMN "ruta_archivo_reporte" VARCHAR(500) NOT NULL,
  ADD COLUMN "nombre_original_reporte" VARCHAR(255) NOT NULL,
  ADD COLUMN "ruta_archivo_certificado" VARCHAR(500) NOT NULL,
  ADD COLUMN "nombre_original_certificado" VARCHAR(255) NOT NULL;
