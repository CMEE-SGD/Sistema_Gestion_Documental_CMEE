/*
  Warnings:

  - Made the column `nombre_original` on table `certificado` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "certificado" ALTER COLUMN "nombre_original" SET NOT NULL;
