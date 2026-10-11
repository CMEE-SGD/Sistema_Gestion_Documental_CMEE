-- Comprobante de entrega (foto/PDF) + monto que registra Servicio al Cliente
-- en la fase "Listo para entrega", y bandera de notificación a Financiero
-- cuando la orden queda completa (todos sus equipos FINALIZADO).
ALTER TABLE "ordenes_trabajo"
    ADD COLUMN "comprobante_ruta" VARCHAR(500),
    ADD COLUMN "comprobante_nombre" VARCHAR(255),
    ADD COLUMN "monto_comprobante" DECIMAL(12,2),
    ADD COLUMN "comprobante_subido_por_id" INTEGER,
    ADD COLUMN "comprobante_subido_at" TIMESTAMPTZ,
    ADD COLUMN "notificado_facturacion" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ordenes_trabajo"
    ADD CONSTRAINT "ordenes_trabajo_comprobante_subido_por_id_fkey"
    FOREIGN KEY ("comprobante_subido_por_id") REFERENCES "persona"("id")
    ON UPDATE CASCADE ON DELETE SET NULL;

-- La factura hereda (snapshot) el comprobante de la orden al crearse, para
-- que quede vinculado y visible desde el detalle de la factura.
ALTER TABLE "facturas"
    ADD COLUMN "comprobante_ruta" VARCHAR(500),
    ADD COLUMN "comprobante_nombre" VARCHAR(255),
    ADD COLUMN "monto_comprobante" DECIMAL(12,2);
