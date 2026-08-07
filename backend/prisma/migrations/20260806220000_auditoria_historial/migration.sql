-- CreateTable: historial de transiciones de estado de auditorías internas
CREATE TABLE "auditoria_historial" (
    "id" SERIAL NOT NULL,
    "auditoria_id" INTEGER NOT NULL,
    "estado_anterior" "EstadoAuditoria",
    "estado_nuevo" "EstadoAuditoria" NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "observaciones" TEXT,
    "realizado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_historial_auditoria_id_idx" ON "auditoria_historial"("auditoria_id");

-- AddForeignKey
ALTER TABLE "auditoria_historial" ADD CONSTRAINT "auditoria_historial_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditoria_interna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_historial" ADD CONSTRAINT "auditoria_historial_realizado_por_id_fkey" FOREIGN KEY ("realizado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
