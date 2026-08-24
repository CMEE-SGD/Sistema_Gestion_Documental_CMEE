-- AlterTable
ALTER TABLE "certificado" ALTER COLUMN "codigo_verificacion" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificado_codigo_verificacion_key" ON "certificado"("codigo_verificacion");

