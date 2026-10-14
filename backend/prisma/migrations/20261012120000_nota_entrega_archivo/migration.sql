-- Adjunto (imagen o PDF) de la nota de entrega.
ALTER TABLE "notas_entrega"
    ADD COLUMN "archivo_ruta" VARCHAR(500),
    ADD COLUMN "archivo_nombre" VARCHAR(255);
