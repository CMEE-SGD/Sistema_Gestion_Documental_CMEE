-- CreateEnum
CREATE TYPE "CondicionPagoOrden" AS ENUM ('CONTADO', 'CREDITO', 'SIN_COSTO');

-- AlterTable
ALTER TABLE "ordenes_trabajo" ADD COLUMN     "condicion_pago" "CondicionPagoOrden",
ADD COLUMN     "monto_sin_iva" DECIMAL(12,2);

