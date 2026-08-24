-- CreateTable
CREATE TABLE "documentos_versiones" (
    "id" SERIAL NOT NULL,
    "documento_id" INTEGER NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "archivo_url" TEXT NOT NULL,
    "subido_por" VARCHAR(150),
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_versiones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documentos_versiones" ADD CONSTRAINT "documentos_versiones_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
