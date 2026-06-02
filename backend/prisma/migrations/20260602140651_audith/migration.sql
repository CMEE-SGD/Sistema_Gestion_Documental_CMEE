/*
  Warnings:

  - You are about to alter the column `codigo` on the `documentos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- CreateEnum
CREATE TYPE "CircuitoDocumento" AS ENUM ('SIN_CLASIFICAR', 'ALTA_FRECUENCIA', 'ATENCION_AL_CLIENTE', 'BAJA_FRECUENCIA', 'CALIDAD', 'CAPACITACION', 'CUALIFICACION', 'FORMATOS', 'GESTION_DE_PATRONES', 'GESTION_LOGISTICA', 'LEGALIZACION', 'PRESION', 'PROCEDIMIENTOS_GESTION_DOCUMENTAL', 'TERMOMETRIA', 'TIEMPO');

-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "circuito" "CircuitoDocumento" NOT NULL DEFAULT 'SIN_CLASIFICAR',
ADD COLUMN     "empresa" VARCHAR(200) DEFAULT 'Centro de Metrología del Ejército Ecuatoriano',
ADD COLUMN     "fecha_documento" DATE,
ALTER COLUMN "codigo" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "version" SET DEFAULT '1';
