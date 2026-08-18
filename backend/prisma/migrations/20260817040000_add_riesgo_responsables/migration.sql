-- AlterTable: Add closure fields, drop responsable_id
ALTER TABLE "riesgo_oportunidad" ADD COLUMN "verificacion_eficacia" TEXT;
ALTER TABLE "riesgo_oportunidad" ADD COLUMN "cierre_fecha" DATE;
ALTER TABLE "riesgo_oportunidad" ADD COLUMN "cerrada_por" VARCHAR(150);
ALTER TABLE "riesgo_oportunidad" DROP CONSTRAINT IF EXISTS "riesgo_oportunidad_responsable_id_fkey";
DROP INDEX IF EXISTS "riesgo_oportunidad_responsable_id_idx";
ALTER TABLE "riesgo_oportunidad" DROP COLUMN IF EXISTS "responsable_id";

-- CreateTable
CREATE TABLE "riesgo_responsable" (
    "id" SERIAL NOT NULL,
    "riesgo_id" INTEGER NOT NULL,
    "fase" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(150),
    "fecha" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riesgo_responsable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "riesgo_responsable_riesgo_id_idx" ON "riesgo_responsable"("riesgo_id");

-- AddForeignKey
ALTER TABLE "riesgo_responsable" ADD CONSTRAINT "riesgo_responsable_riesgo_id_fkey" FOREIGN KEY ("riesgo_id") REFERENCES "riesgo_oportunidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
