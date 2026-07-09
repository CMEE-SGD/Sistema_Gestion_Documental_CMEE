/*
  Warnings:

  - A unique constraint covering the columns `[ruc]` on the table `clientes_institucionales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `direccion` to the `clientes_institucionales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante` to the `clientes_institucionales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `clientes_institucionales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes_institucionales" ADD COLUMN     "direccion" VARCHAR(250) NOT NULL,
ADD COLUMN     "email" VARCHAR(150),
ADD COLUMN     "representante" VARCHAR(150) NOT NULL,
ADD COLUMN     "ruc" VARCHAR(20),
ADD COLUMN     "telefono" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_institucionales_ruc_key" ON "clientes_institucionales"("ruc");
