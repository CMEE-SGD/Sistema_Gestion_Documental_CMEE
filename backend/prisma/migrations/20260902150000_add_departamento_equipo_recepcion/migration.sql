-- AlterTable
ALTER TABLE "equipos_recepcion" ADD COLUMN "departamento_id" INTEGER;

-- CreateIndex
CREATE INDEX "equipos_recepcion_departamento_id_idx" ON "equipos_recepcion"("departamento_id");

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
