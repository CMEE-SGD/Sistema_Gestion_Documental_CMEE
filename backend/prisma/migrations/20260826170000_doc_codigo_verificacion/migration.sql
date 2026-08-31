-- AlterTable
ALTER TABLE "documentos" ADD COLUMN "codigo_verificacion" VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS "documentos_codigo_verificacion_key" ON "documentos"("codigo_verificacion");
