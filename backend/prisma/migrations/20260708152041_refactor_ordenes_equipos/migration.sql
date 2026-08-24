/*
  Warnings:

  - You are about to drop the column `recepcion_equipo_id` on the `certificado` table. All the data in the column will be lost.
  - You are about to drop the column `recepcion_equipo_id` on the `historial_estado` table. All the data in the column will be lost.
  - You are about to drop the `recepcion_equipos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `equipo_recepcion_id` to the `certificado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipo_recepcion_id` to the `historial_estado` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "certificado" DROP CONSTRAINT "certificado_recepcion_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "historial_estado" DROP CONSTRAINT "historial_estado_recepcion_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "recepcion_equipos" DROP CONSTRAINT "recepcion_equipos_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "recepcion_equipos" DROP CONSTRAINT "recepcion_equipos_laboratorio_id_fkey";

-- DropForeignKey
ALTER TABLE "recepcion_equipos" DROP CONSTRAINT "recepcion_equipos_tecnico_id_fkey";

-- DropIndex
DROP INDEX "certificado_recepcion_equipo_id_idx";

-- DropIndex
DROP INDEX "historial_estado_recepcion_equipo_id_idx";

-- AlterTable
ALTER TABLE "certificado" DROP COLUMN "recepcion_equipo_id",
ADD COLUMN     "equipo_recepcion_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "historial_estado" DROP COLUMN "recepcion_equipo_id",
ADD COLUMN     "equipo_recepcion_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "recepcion_equipos";

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" SERIAL NOT NULL,
    "orden_trabajo_fisica" VARCHAR(50) NOT NULL,
    "fecha_ingreso" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos_recepcion" (
    "id" SERIAL NOT NULL,
    "orden_trabajo_id" INTEGER NOT NULL,
    "equipo_descripcion" VARCHAR(200) NOT NULL,
    "codigo_serie" VARCHAR(100),
    "laboratorio_id" INTEGER NOT NULL,
    "estado" "EstadoRecepcion" NOT NULL DEFAULT 'EN_ESPERA',
    "tecnico_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "equipos_recepcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_orden_trabajo_fisica_key" ON "ordenes_trabajo"("orden_trabajo_fisica");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_cliente_id_idx" ON "ordenes_trabajo"("cliente_id");

-- CreateIndex
CREATE INDEX "equipos_recepcion_orden_trabajo_id_idx" ON "equipos_recepcion"("orden_trabajo_id");

-- CreateIndex
CREATE INDEX "equipos_recepcion_tecnico_id_idx" ON "equipos_recepcion"("tecnico_id");

-- CreateIndex
CREATE INDEX "equipos_recepcion_laboratorio_id_idx" ON "equipos_recepcion"("laboratorio_id");

-- CreateIndex
CREATE INDEX "certificado_equipo_recepcion_id_idx" ON "certificado"("equipo_recepcion_id");

-- CreateIndex
CREATE INDEX "historial_estado_equipo_recepcion_id_idx" ON "historial_estado"("equipo_recepcion_id");

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_institucionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_orden_trabajo_id_fkey" FOREIGN KEY ("orden_trabajo_id") REFERENCES "ordenes_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_equipo_recepcion_id_fkey" FOREIGN KEY ("equipo_recepcion_id") REFERENCES "equipos_recepcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_equipo_recepcion_id_fkey" FOREIGN KEY ("equipo_recepcion_id") REFERENCES "equipos_recepcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
