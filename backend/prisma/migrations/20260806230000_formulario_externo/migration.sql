-- AlterTable: campos del formulario de auditoría/evaluación EXTERNA (SAE)
ALTER TABLE "auditoria_interna" ADD COLUMN "nombre_oec" TEXT,
ADD COLUMN "expediente_nro" VARCHAR(100),
ADD COLUMN "tipo_oec" VARCHAR(100),
ADD COLUMN "persona_contacto" VARCHAR(150),
ADD COLUMN "norma_acreditacion" TEXT,
ADD COLUMN "actividades_evaluacion" TEXT,
ADD COLUMN "idioma_evaluacion" VARCHAR(50);
