-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('CORRECTIVA', 'PREVENTIVA');

-- CreateEnum
CREATE TYPE "OrigenAccion" AS ENUM ('AUDITORIA_NC', 'QUEJA', 'RIESGO', 'TRABAJO_NC');

-- CreateEnum
CREATE TYPE "EstadoAccion" AS ENUM ('ABIERTA', 'EN_EJECUCION', 'VERIFICADA', 'CERRADA');

-- CreateTable
CREATE TABLE "accion_correctiva_preventiva" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "tipo" "TipoAccion" NOT NULL,
    "origen_tipo" "OrigenAccion" NOT NULL,
    "origen_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "causa" TEXT,
    "responsable" VARCHAR(150),
    "fecha_limite" DATE,
    "estado" "EstadoAccion" NOT NULL DEFAULT 'ABIERTA',
    "eficaz" BOOLEAN,
    "verificacion_eficacia" TEXT,
    "fecha_cierre" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "accion_correctiva_preventiva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accion_correctiva_preventiva_codigo_key" ON "accion_correctiva_preventiva"("codigo");

-- CreateIndex
CREATE INDEX "accion_correctiva_preventiva_origen_tipo_origen_id_idx" ON "accion_correctiva_preventiva"("origen_tipo", "origen_id");
