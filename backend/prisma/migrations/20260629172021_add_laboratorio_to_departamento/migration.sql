-- AlterTable
ALTER TABLE "departamento" ADD COLUMN     "laboratorio_id" INTEGER;

-- CreateIndex
CREATE INDEX "departamento_laboratorio_id_idx" ON "departamento"("laboratorio_id");

-- AddForeignKey
ALTER TABLE "departamento" ADD CONSTRAINT "departamento_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
