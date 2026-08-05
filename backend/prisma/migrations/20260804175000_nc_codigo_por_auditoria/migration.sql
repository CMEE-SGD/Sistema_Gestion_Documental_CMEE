-- DropIndex
DROP INDEX "no_conformidad_auditoria_id_idx";

-- DropIndex
DROP INDEX "no_conformidad_codigo_key";

-- CreateIndex
CREATE UNIQUE INDEX "no_conformidad_auditoria_id_codigo_key" ON "no_conformidad"("auditoria_id", "codigo");
