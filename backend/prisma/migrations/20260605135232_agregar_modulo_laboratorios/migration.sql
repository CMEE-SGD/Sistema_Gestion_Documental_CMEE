-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('OPERATIVO', 'EN_CALIBRACION', 'FUERA_DE_SERVICIO');

-- CreateTable
CREATE TABLE "laboratorio" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "responsable_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "marca" VARCHAR(100),
    "modelo" VARCHAR(100),
    "numero_serie" VARCHAR(100),
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'OPERATIVO',
    "laboratorio_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "magnitud" VARCHAR(100),
    "descripcion" TEXT,
    "laboratorio_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "laboratorio_codigo_key" ON "laboratorio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "laboratorio_nombre_key" ON "laboratorio"("nombre");

-- CreateIndex
CREATE INDEX "laboratorio_responsable_id_idx" ON "laboratorio"("responsable_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_codigo_key" ON "equipo"("codigo");

-- CreateIndex
CREATE INDEX "equipo_laboratorio_id_idx" ON "equipo"("laboratorio_id");

-- CreateIndex
CREATE INDEX "servicio_laboratorio_id_idx" ON "servicio"("laboratorio_id");

-- AddForeignKey
ALTER TABLE "laboratorio" ADD CONSTRAINT "laboratorio_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo" ADD CONSTRAINT "equipo_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio" ADD CONSTRAINT "servicio_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
