-- Solicitud de autorización al Director para registrar una compensación
-- (pago con entrega de equipos). El formulario se habilita al aprobarse.

-- CreateTable
CREATE TABLE "solicitud_compensacion" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "solicitado_por_id" INTEGER,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "resuelto_por_id" INTEGER,
    "resuelto_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_compensacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitud_compensacion_factura_id_idx" ON "solicitud_compensacion"("factura_id");

-- AddForeignKey
ALTER TABLE "solicitud_compensacion" ADD CONSTRAINT "solicitud_compensacion_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_compensacion" ADD CONSTRAINT "solicitud_compensacion_solicitado_por_id_fkey" FOREIGN KEY ("solicitado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_compensacion" ADD CONSTRAINT "solicitud_compensacion_resuelto_por_id_fkey" FOREIGN KEY ("resuelto_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;