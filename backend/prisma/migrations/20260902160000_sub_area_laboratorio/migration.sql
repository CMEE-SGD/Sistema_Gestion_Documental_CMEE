-- Revert: sub-área modelada como Departamento (RRHH) resultó ser el
-- concepto equivocado — Departamento implica reconocimiento institucional
-- formal en el organigrama, que esta división interna todavía no tiene.
-- Se reemplaza por un catálogo propio de Laboratorios (SubAreaLaboratorio).

-- DropForeignKey
ALTER TABLE "equipos_recepcion" DROP CONSTRAINT "equipos_recepcion_departamento_id_fkey";

-- DropIndex
DROP INDEX "equipos_recepcion_departamento_id_idx";

-- AlterTable
ALTER TABLE "equipos_recepcion" DROP COLUMN "departamento_id";
ALTER TABLE "equipos_recepcion" ADD COLUMN "sub_area_id" INTEGER;

-- CreateTable
CREATE TABLE "sub_area_laboratorio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "laboratorio_id" INTEGER NOT NULL,
    "responsable_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sub_area_laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_area_laboratorio_laboratorio_id_idx" ON "sub_area_laboratorio"("laboratorio_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_area_laboratorio_laboratorio_id_nombre_key" ON "sub_area_laboratorio"("laboratorio_id", "nombre");

-- CreateIndex
CREATE INDEX "equipos_recepcion_sub_area_id_idx" ON "equipos_recepcion"("sub_area_id");

-- AddForeignKey
ALTER TABLE "sub_area_laboratorio" ADD CONSTRAINT "sub_area_laboratorio_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_area_laboratorio" ADD CONSTRAINT "sub_area_laboratorio_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_sub_area_id_fkey" FOREIGN KEY ("sub_area_id") REFERENCES "sub_area_laboratorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
