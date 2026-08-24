/*
  Warnings:

  - Added the required column `hallazgo` to the `no_conformidad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "no_conformidad" ADD COLUMN     "aceptada_oec" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "evidencia" TEXT,
ADD COLUMN     "hallazgo" TEXT DEFAULT '',
ADD COLUMN     "reiterada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requisito" VARCHAR(500),
ALTER COLUMN "descripcion" DROP NOT NULL;

-- Backfill hallazgo con descripcion para filas existentes
UPDATE "no_conformidad" SET "hallazgo" = COALESCE("descripcion", '') WHERE "hallazgo" IS NULL;

-- Ahora hacer NOT NULL hallazgo
ALTER TABLE "no_conformidad" ALTER COLUMN "hallazgo" SET NOT NULL,
ALTER COLUMN "hallazgo" DROP DEFAULT;
