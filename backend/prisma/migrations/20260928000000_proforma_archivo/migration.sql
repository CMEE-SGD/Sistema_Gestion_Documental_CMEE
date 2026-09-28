-- Archivo adjunto (PDF/imagen de la cotización) de la proforma: ruta servida
-- por /uploads y nombre original del archivo subido al crearla.

-- AlterTable
ALTER TABLE "proformas" ADD COLUMN "archivo" VARCHAR(500);
ALTER TABLE "proformas" ADD COLUMN "archivo_nombre" VARCHAR(255);