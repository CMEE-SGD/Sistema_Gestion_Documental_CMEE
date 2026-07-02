-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoRecepcion" ADD VALUE 'REVISION_OBT';
ALTER TYPE "EstadoRecepcion" ADD VALUE 'PENDIENTE_FIRMA_TECNICO';
ALTER TYPE "EstadoRecepcion" ADD VALUE 'REVISION_JEFE';
ALTER TYPE "EstadoRecepcion" ADD VALUE 'REVISION_DIRECTOR';
ALTER TYPE "EstadoRecepcion" ADD VALUE 'LISTO_PARA_ENTREGA';

-- CreateTable
CREATE TABLE "historial_estado" (
    "id" SERIAL NOT NULL,
    "recepcion_equipo_id" INTEGER NOT NULL,
    "estado_anterior" "EstadoRecepcion" NOT NULL,
    "estado_nuevo" "EstadoRecepcion" NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "observaciones" TEXT,
    "realizado_por_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_estado_recepcion_equipo_id_idx" ON "historial_estado"("recepcion_equipo_id");

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_recepcion_equipo_id_fkey" FOREIGN KEY ("recepcion_equipo_id") REFERENCES "recepcion_equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_realizado_por_id_fkey" FOREIGN KEY ("realizado_por_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
