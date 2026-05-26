-- CreateTable
CREATE TABLE "aplicacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "aplicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_aplicacion" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "aplicacion_id" INTEGER NOT NULL,
    "nivel" SMALLINT NOT NULL,
    "orden" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grupo_aplicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aplicacion_nombre_key" ON "aplicacion"("nombre");

-- CreateIndex
CREATE INDEX "grupo_aplicacion_grupo_id_idx" ON "grupo_aplicacion"("grupo_id");

-- CreateIndex
CREATE INDEX "grupo_aplicacion_aplicacion_id_idx" ON "grupo_aplicacion"("aplicacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_aplicacion_grupo_id_aplicacion_id_key" ON "grupo_aplicacion"("grupo_id", "aplicacion_id");

-- AddForeignKey
ALTER TABLE "grupo_aplicacion" ADD CONSTRAINT "grupo_aplicacion_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_aplicacion" ADD CONSTRAINT "grupo_aplicacion_aplicacion_id_fkey" FOREIGN KEY ("aplicacion_id") REFERENCES "aplicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
