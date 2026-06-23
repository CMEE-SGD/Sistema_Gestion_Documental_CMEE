/*
  Warnings:

  - You are about to drop the column `activo` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_postal` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `fax` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `saludo` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `persona` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoPersona" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- DropIndex
DROP INDEX "persona_codigo_key";

-- AlterTable
ALTER TABLE "persona" DROP COLUMN "activo",
DROP COLUMN "celular",
DROP COLUMN "codigo",
DROP COLUMN "codigo_postal",
DROP COLUMN "fax",
DROP COLUMN "saludo",
DROP COLUMN "telefono",
ADD COLUMN     "celular_1" VARCHAR(20),
ADD COLUMN     "celular_2" VARCHAR(20),
ADD COLUMN     "estado" "EstadoPersona" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "grado" VARCHAR(30);
