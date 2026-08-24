-- AlterTable: Add num_iac, drop responsable_id
ALTER TABLE "queja" ADD COLUMN "num_iac" VARCHAR(50);
ALTER TABLE "queja" DROP CONSTRAINT IF EXISTS "queja_responsable_id_fkey";
DROP INDEX IF EXISTS "queja_responsable_id_idx";
ALTER TABLE "queja" DROP COLUMN IF EXISTS "responsable_id";

-- CreateTable
CREATE TABLE "queja_responsable" (
    "id" SERIAL NOT NULL,
    "queja_id" INTEGER NOT NULL,
    "fase" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(150),
    "fecha" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queja_responsable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queja_responsable_queja_id_idx" ON "queja_responsable"("queja_id");

-- AddForeignKey
ALTER TABLE "queja_responsable" ADD CONSTRAINT "queja_responsable_queja_id_fkey" FOREIGN KEY ("queja_id") REFERENCES "queja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
