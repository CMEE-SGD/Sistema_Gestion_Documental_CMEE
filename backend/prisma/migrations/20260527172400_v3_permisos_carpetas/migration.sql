/*
  Warnings:

  - You are about to drop the column `rol_carpeta_id` on the `carpetas_permisos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "carpetas_permisos" DROP CONSTRAINT "carpetas_permisos_rol_carpeta_id_fkey";

-- DropIndex
DROP INDEX "carpetas_permisos_carpeta_id_rol_carpeta_id_key";

-- AlterTable
ALTER TABLE "carpetas" ADD COLUMN     "codigo" VARCHAR(50),
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "etiquetas" TEXT,
ADD COLUMN     "version_inicial" TEXT DEFAULT '1';

-- AlterTable
ALTER TABLE "carpetas_permisos" DROP COLUMN "rol_carpeta_id",
ADD COLUMN     "departamento_id" INTEGER,
ADD COLUMN     "nivel_permiso" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "permiso_carpetas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permiso_docs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permiso_extra" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "persona_id" INTEGER;

-- AddForeignKey
ALTER TABLE "carpetas_permisos" ADD CONSTRAINT "carpetas_permisos_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas_permisos" ADD CONSTRAINT "carpetas_permisos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
