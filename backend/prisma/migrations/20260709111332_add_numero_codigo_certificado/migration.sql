-- AlterTable
ALTER TABLE "certificado" ADD COLUMN     "codigo_verificacion" TEXT,
ADD COLUMN     "numero_certificado" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificado_numero_certificado_key" ON "certificado"("numero_certificado");

