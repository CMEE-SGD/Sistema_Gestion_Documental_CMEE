-- Vínculo formal de la factura a la orden de trabajo que la origina: la
-- factura se habilita cuando todos los equipos de la orden llegan a
-- FINALIZADO. Se guarda orden_trabajo_id en la cabecera de la factura para
-- la trazabilidad orden → factura en el módulo financiero.

ALTER TABLE "facturas" ADD COLUMN "orden_trabajo_id" INTEGER;
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_orden_trabajo_id_fkey"
  FOREIGN KEY ("orden_trabajo_id") REFERENCES "ordenes_trabajo"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "facturas_orden_trabajo_id_idx" ON "facturas"("orden_trabajo_id");