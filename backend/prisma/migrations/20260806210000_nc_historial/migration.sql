-- CreateTable: historial de transiciones de estado de no conformidades
CREATE TABLE "no_conformidad_historial" (
    "id" SERIAL NOT NULL,
    "nc_id" INTEGER NOT NULL,
    "estado_anterior" "EstadoNC",
    "estado_nuevo" "EstadoNC" NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "observaciones" TEXT,
    "realizado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "no_conformidad_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "no_conformidad_historial_nc_id_idx" ON "no_conformidad_historial"("nc_id");

-- AddForeignKey
ALTER TABLE "no_conformidad_historial" ADD CONSTRAINT "no_conformidad_historial_nc_id_fkey" FOREIGN KEY ("nc_id") REFERENCES "no_conformidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_conformidad_historial" ADD CONSTRAINT "no_conformidad_historial_realizado_por_id_fkey" FOREIGN KEY ("realizado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
