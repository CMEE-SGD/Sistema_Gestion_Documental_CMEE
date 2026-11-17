-- AlterTable: el responsable pasa de texto libre a una Persona
ALTER TABLE "accion_correctiva_preventiva" ADD COLUMN "responsable_id" INTEGER;

-- Conserva el responsable de las filas existentes cuando el texto coincide
-- con el nombre completo de una persona (con o sin grado).
UPDATE "accion_correctiva_preventiva" a
SET "responsable_id" = (
    SELECT p."id" FROM "persona" p
    WHERE trim(concat_ws(' ', p."nombre", p."apellidos")) = trim(a."responsable")
       OR trim(concat_ws(' ', p."grado", p."nombre", p."apellidos")) = trim(a."responsable")
    ORDER BY p."id"
    LIMIT 1
)
WHERE a."responsable" IS NOT NULL;

ALTER TABLE "accion_correctiva_preventiva" DROP COLUMN "responsable";

-- CreateIndex
CREATE INDEX "accion_correctiva_preventiva_responsable_id_idx" ON "accion_correctiva_preventiva"("responsable_id");

-- AddForeignKey
ALTER TABLE "accion_correctiva_preventiva" ADD CONSTRAINT "accion_correctiva_preventiva_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
