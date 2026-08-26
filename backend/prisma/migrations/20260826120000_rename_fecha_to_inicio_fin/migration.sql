-- AlterTable: Rename `fecha` to `fecha_inicio` + `fecha_fin` in `capacitaciones`
ALTER TABLE "capacitaciones" ADD COLUMN "fecha_fin" DATE;
ALTER TABLE "capacitaciones" ADD COLUMN "fecha_inicio" DATE;
UPDATE "capacitaciones" SET "fecha_inicio" = "fecha", "fecha_fin" = "fecha";
ALTER TABLE "capacitaciones" DROP COLUMN "fecha";
ALTER TABLE "capacitaciones" ALTER COLUMN "fecha_inicio" SET NOT NULL;
ALTER TABLE "capacitaciones" ALTER COLUMN "fecha_fin" SET NOT NULL;
