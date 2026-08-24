-- CreateEnum
CREATE TYPE "EstadoQueja" AS ENUM ('RECIBIDA', 'EN_ANALISIS', 'PROCEDENTE', 'NO_PROCEDENTE', 'EN_SEGUIMIENTO', 'CERRADA');

-- CreateTable
CREATE TABLE "queja" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "cliente" VARCHAR(200),
    "telefono_contacto" VARCHAR(50),
    "email_contacto" VARCHAR(150),
    "formulado_por" VARCHAR(150),
    "descripcion_queja" TEXT NOT NULL,
    "recibida_por" VARCHAR(150),
    "recibida_fecha" DATE,
    "area_afectada" VARCHAR(100),
    "procedente" BOOLEAN,
    "justificativo_no_procede" TEXT,
    "acciones" TEXT,
    "responsable_id" INTEGER,
    "fecha_limite" DATE,
    "verificacion_eficacia" TEXT,
    "cierre_fecha" DATE,
    "cerrada_por" VARCHAR(150),
    "estado" "EstadoQueja" NOT NULL DEFAULT 'RECIBIDA',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "queja_codigo_key" ON "queja"("codigo");

-- CreateIndex
CREATE INDEX "queja_responsable_id_idx" ON "queja"("responsable_id");

-- AddForeignKey
ALTER TABLE "queja" ADD CONSTRAINT "queja_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
