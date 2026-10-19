-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "porcentaje_retencion_renta" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "retencion_renta" DECIMAL(12,2) NOT NULL DEFAULT 0;
