-- CreateEnum
CREATE TYPE "TipoRiesgo" AS ENUM ('RIESGO', 'OPORTUNIDAD');

-- CreateEnum
CREATE TYPE "CondicionRiesgo" AS ENUM ('ALTO', 'MODERADO', 'LEVE');

-- CreateEnum
CREATE TYPE "EstadoRiesgo" AS ENUM ('IDENTIFICADO', 'EN_SEGUIMIENTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "TratamientoRiesgo" AS ENUM ('EVITAR', 'REDUCIR', 'ASUMIR');

-- CreateTable
CREATE TABLE "riesgo_oportunidad" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "tipo" "TipoRiesgo" NOT NULL DEFAULT 'RIESGO',
    "proceso" VARCHAR(100) NOT NULL,
    "evento" TEXT NOT NULL,
    "causa" TEXT,
    "fuente" TEXT,
    "consecuencias" TEXT,
    "probabilidad" SMALLINT NOT NULL,
    "impacto" SMALLINT NOT NULL,
    "deteccion" SMALLINT NOT NULL,
    "nivel_riesgo" SMALLINT NOT NULL,
    "condicion" "CondicionRiesgo" NOT NULL DEFAULT 'LEVE',
    "tratamiento" "TratamientoRiesgo",
    "acciones" TEXT,
    "responsable_id" INTEGER,
    "fecha_limite" DATE,
    "estado" "EstadoRiesgo" NOT NULL DEFAULT 'IDENTIFICADO',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riesgo_oportunidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "riesgo_oportunidad_codigo_key" ON "riesgo_oportunidad"("codigo");

-- CreateIndex
CREATE INDEX "riesgo_oportunidad_responsable_id_idx" ON "riesgo_oportunidad"("responsable_id");

-- AddForeignKey
ALTER TABLE "riesgo_oportunidad" ADD CONSTRAINT "riesgo_oportunidad_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
