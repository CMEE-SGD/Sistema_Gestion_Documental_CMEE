-- AlterTable
ALTER TABLE "facturas" ADD COLUMN "retencion_iva" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "porcentaje_retencion_iva" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "retenciones" JSONB;