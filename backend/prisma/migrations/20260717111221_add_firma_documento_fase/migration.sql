-- CreateTable
CREATE TABLE "firma_documento_fase" (
    "id" SERIAL NOT NULL,
    "documento_workflow_fase_id" INTEGER NOT NULL,
    "firmante_id" INTEGER NOT NULL,
    "certificado_titular" VARCHAR(200) NOT NULL,
    "certificado_emisor" VARCHAR(200) NOT NULL,
    "certificado_numero_serie" VARCHAR(100) NOT NULL,
    "certificado_valido_desde" TIMESTAMP(3) NOT NULL,
    "certificado_valido_hasta" TIMESTAMP(3) NOT NULL,
    "hash_documento" VARCHAR(128) NOT NULL,
    "fecha_firma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firma_documento_fase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "firma_documento_fase_documento_workflow_fase_id_idx" ON "firma_documento_fase"("documento_workflow_fase_id");

-- CreateIndex
CREATE INDEX "firma_documento_fase_firmante_id_idx" ON "firma_documento_fase"("firmante_id");

-- AddForeignKey
ALTER TABLE "firma_documento_fase" ADD CONSTRAINT "firma_documento_fase_documento_workflow_fase_id_fkey" FOREIGN KEY ("documento_workflow_fase_id") REFERENCES "documentos_workflow_fases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_documento_fase" ADD CONSTRAINT "firma_documento_fase_firmante_id_fkey" FOREIGN KEY ("firmante_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

