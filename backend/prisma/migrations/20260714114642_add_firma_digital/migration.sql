-- CreateEnum
CREATE TYPE "EtapaFirma" AS ENUM ('TECNICO', 'JEFE', 'DIRECTOR');

-- CreateTable
CREATE TABLE "firma_digital" (
    "id" SERIAL NOT NULL,
    "certificado_id" INTEGER NOT NULL,
    "firmante_id" INTEGER NOT NULL,
    "etapa" "EtapaFirma" NOT NULL,
    "certificado_titular" VARCHAR(200) NOT NULL,
    "certificado_emisor" VARCHAR(200) NOT NULL,
    "certificado_numero_serie" VARCHAR(100) NOT NULL,
    "certificado_valido_desde" TIMESTAMP(3) NOT NULL,
    "certificado_valido_hasta" TIMESTAMP(3) NOT NULL,
    "hash_documento" VARCHAR(128) NOT NULL,
    "fecha_firma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firma_digital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "firma_digital_certificado_id_idx" ON "firma_digital"("certificado_id");

-- CreateIndex
CREATE INDEX "firma_digital_firmante_id_idx" ON "firma_digital"("firmante_id");

-- AddForeignKey
ALTER TABLE "firma_digital" ADD CONSTRAINT "firma_digital_certificado_id_fkey" FOREIGN KEY ("certificado_id") REFERENCES "certificado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_digital" ADD CONSTRAINT "firma_digital_firmante_id_fkey" FOREIGN KEY ("firmante_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
