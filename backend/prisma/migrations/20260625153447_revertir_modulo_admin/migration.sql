/*
  Warnings:

  - You are about to drop the `cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitud` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "solicitud" DROP CONSTRAINT "solicitud_asignado_por_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitud" DROP CONSTRAINT "solicitud_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitud" DROP CONSTRAINT "solicitud_creado_por_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitud" DROP CONSTRAINT "solicitud_laboratorio_id_fkey";

-- DropTable
DROP TABLE "cliente";

-- DropTable
DROP TABLE "solicitud";

-- DropEnum
DROP TYPE "EstadoAdministrativo";
