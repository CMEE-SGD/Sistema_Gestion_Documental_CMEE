-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "documento_id" INTEGER,
    "persona_afectada_id" INTEGER,
    "fecha_hora" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_documento_id_idx" ON "auditoria"("documento_id");

-- CreateIndex
CREATE INDEX "auditoria_modulo_idx" ON "auditoria"("modulo");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_persona_afectada_id_fkey" FOREIGN KEY ("persona_afectada_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
