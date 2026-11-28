-- CreateTable
CREATE TABLE "descarga_certificado" (
    "id" SERIAL NOT NULL,
    "certificado_id" INTEGER NOT NULL,
    "persona_id" INTEGER,
    "usuario_id" INTEGER,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descarga_certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "descarga_certificado_certificado_id_persona_id_idx" ON "descarga_certificado"("certificado_id", "persona_id");

-- AddForeignKey
ALTER TABLE "descarga_certificado" ADD CONSTRAINT "descarga_certificado_certificado_id_fkey" FOREIGN KEY ("certificado_id") REFERENCES "certificado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

