-- AlterTable
ALTER TABLE "auditoria_interna" ALTER COLUMN "tipo_evaluacion" SET DATA TYPE JSONB;

-- CreateIndex
CREATE INDEX "no_conformidad_auditoria_id_idx" ON "no_conformidad"("auditoria_id");

-- RenameIndex
ALTER INDEX "uq_no_conformidad_auditoria_codigo" RENAME TO "no_conformidad_auditoria_id_codigo_key";
