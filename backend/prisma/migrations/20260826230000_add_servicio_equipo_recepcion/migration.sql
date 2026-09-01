-- AlterTable
ALTER TABLE "equipos_recepcion" ADD COLUMN "servicio_id" INTEGER;

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;