-- CreateTable
CREATE TABLE "trabajo_no_conforme_archivo" (
    "id" SERIAL NOT NULL,
    "trabajo_no_conforme_id" INTEGER NOT NULL,
    "seccion" VARCHAR(30) NOT NULL DEFAULT 'SEGUIMIENTO',
    "nombre_original" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "subido_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trabajo_no_conforme_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trabajo_no_conforme_archivo_trabajo_no_conforme_id_idx" ON "trabajo_no_conforme_archivo"("trabajo_no_conforme_id");

-- AddForeignKey
ALTER TABLE "trabajo_no_conforme_archivo" ADD CONSTRAINT "trabajo_no_conforme_archivo_trabajo_no_conforme_id_fkey" FOREIGN KEY ("trabajo_no_conforme_id") REFERENCES "trabajo_no_conforme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

