-- CreateTable
CREATE TABLE "certificado" (
    "id" SERIAL NOT NULL,
    "recepcion_equipo_id" INTEGER NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "nombre_original" VARCHAR(255),
    "fecha_subida" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tecnico_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificado_recepcion_equipo_id_idx" ON "certificado"("recepcion_equipo_id");

-- CreateIndex
CREATE INDEX "certificado_tecnico_id_idx" ON "certificado"("tecnico_id");

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_recepcion_equipo_id_fkey" FOREIGN KEY ("recepcion_equipo_id") REFERENCES "recepcion_equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
