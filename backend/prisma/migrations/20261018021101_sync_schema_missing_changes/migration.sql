-- DropIndex
DROP INDEX "factura_detalle_equipo_recepcion_id_idx";

-- DropIndex
DROP INDEX "facturas_orden_trabajo_id_idx";

-- DropIndex
DROP INDEX "ordenes_trabajo_proforma_id_idx";

-- AlterTable
ALTER TABLE "distribucion_resultado" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "sesion_activa_token_jti_idx" ON "sesion_activa"("token_jti");
