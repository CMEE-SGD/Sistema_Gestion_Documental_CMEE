/*
  Warnings:

  - You are about to drop the column `sede` on the `departamento` table. All the data in the column will be lost.
  - You are about to drop the column `sustituto_id` on the `departamento` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_id` on the `persona` table. All the data in the column will be lost.
  - You are about to drop the column `sustituto_id` on the `puesto` table. All the data in the column will be lost.
  - You are about to drop the column `rol_id` on the `usuario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "departamento" DROP CONSTRAINT "departamento_sustituto_id_fkey";

-- DropForeignKey
ALTER TABLE "persona" DROP CONSTRAINT "persona_departamento_id_fkey";

-- DropForeignKey
ALTER TABLE "puesto" DROP CONSTRAINT "puesto_sustituto_id_fkey";

-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_rol_id_fkey";

-- DropIndex
DROP INDEX "persona_departamento_id_idx";

-- DropIndex
DROP INDEX "usuario_rol_id_idx";

-- AlterTable
ALTER TABLE "departamento" DROP COLUMN "sede",
DROP COLUMN "sustituto_id";

-- AlterTable
ALTER TABLE "persona" DROP COLUMN "departamento_id";

-- AlterTable
ALTER TABLE "puesto" DROP COLUMN "sustituto_id";

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "rol_id";

-- CreateTable
CREATE TABLE "_PersonaRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PersonaRoles_AB_unique" ON "_PersonaRoles"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonaRoles_B_index" ON "_PersonaRoles"("B");

-- AddForeignKey
ALTER TABLE "_PersonaRoles" ADD CONSTRAINT "_PersonaRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonaRoles" ADD CONSTRAINT "_PersonaRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
