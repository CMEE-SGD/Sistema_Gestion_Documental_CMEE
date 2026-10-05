-- AlterTable
ALTER TABLE "egresos" ADD COLUMN "es_viatico" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "egresos" ADD COLUMN "cumple_viatico" BOOLEAN;