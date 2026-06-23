/*
  Warnings:

  - You are about to drop the column `circuito` on the `documentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "documentos" DROP COLUMN "circuito",
ADD COLUMN     "circuito_id" INTEGER;

-- DropEnum
DROP TYPE "CircuitoDocumento";

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_circuito_id_fkey" FOREIGN KEY ("circuito_id") REFERENCES "circuitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
