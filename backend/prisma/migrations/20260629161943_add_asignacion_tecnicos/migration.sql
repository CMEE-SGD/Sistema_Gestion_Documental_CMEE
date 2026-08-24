-- AlterTable
ALTER TABLE "recepcion_equipos" ADD COLUMN     "tecnico_id" INTEGER;

-- CreateIndex
CREATE INDEX "recepcion_equipos_tecnico_id_idx" ON "recepcion_equipos"("tecnico_id");

-- AddForeignKey
ALTER TABLE "recepcion_equipos" ADD CONSTRAINT "recepcion_equipos_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
