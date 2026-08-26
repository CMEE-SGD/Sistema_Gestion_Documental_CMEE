-- CreateTable
CREATE TABLE "capacitacion_archivo" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(300) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "peso_bytes" INTEGER,
    "fecha_subida" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "capacitacion_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "capacitacion_archivo_persona_id_idx" ON "capacitacion_archivo"("persona_id");

-- AddForeignKey
ALTER TABLE "capacitacion_archivo" ADD CONSTRAINT "capacitacion_archivo_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
