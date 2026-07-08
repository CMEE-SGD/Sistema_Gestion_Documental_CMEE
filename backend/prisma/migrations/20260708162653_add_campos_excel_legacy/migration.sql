-- AlterTable
ALTER TABLE "equipos_recepcion" ADD COLUMN     "accesorios" VARCHAR(300),
ADD COLUMN     "codigo_cmee" VARCHAR(50),
ADD COLUMN     "fecha_ingreso_laboratorio" DATE,
ADD COLUMN     "marca" VARCHAR(100),
ADD COLUMN     "modelo" VARCHAR(100),
ADD COLUMN     "requerimientos_calibracion" VARCHAR(500);

-- AlterTable
ALTER TABLE "ordenes_trabajo" ADD COLUMN     "n_proforma" VARCHAR(50),
ADD COLUMN     "recibe_responsable_id" INTEGER;

-- CreateIndex
CREATE INDEX "equipos_recepcion_codigo_cmee_idx" ON "equipos_recepcion"("codigo_cmee");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_recibe_responsable_id_idx" ON "ordenes_trabajo"("recibe_responsable_id");

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_recibe_responsable_id_fkey" FOREIGN KEY ("recibe_responsable_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
