-- CreateEnum
CREATE TYPE "EstadoCapacitacion" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "capacitaciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "fecha" DATE NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,
    "lugar" VARCHAR(250),
    "proveedor" VARCHAR(250),
    "certificado" VARCHAR(500),
    "estado" "EstadoCapacitacion" NOT NULL DEFAULT 'PROGRAMADA',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacitaciones_personas" (
    "id" SERIAL NOT NULL,
    "capacitacion_id" INTEGER NOT NULL,
    "persona_id" INTEGER NOT NULL,

    CONSTRAINT "capacitaciones_personas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capacitaciones_personas_capacitacion_id_persona_id_key" ON "capacitaciones_personas"("capacitacion_id", "persona_id");

-- AddForeignKey
ALTER TABLE "capacitaciones_personas" ADD CONSTRAINT "capacitaciones_personas_capacitacion_id_fkey" FOREIGN KEY ("capacitacion_id") REFERENCES "capacitaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitaciones_personas" ADD CONSTRAINT "capacitaciones_personas_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
