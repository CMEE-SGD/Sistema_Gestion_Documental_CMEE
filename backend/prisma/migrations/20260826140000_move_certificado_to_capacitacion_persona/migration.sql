-- AlterTable: Move certificado from capacitaciones to capacitaciones_personas
ALTER TABLE "capacitaciones_personas" ADD COLUMN "certificado" VARCHAR(500);
UPDATE "capacitaciones_personas" cp SET "certificado" = c."certificado" FROM "capacitaciones" c WHERE cp."capacitacion_id" = c."id" AND c."certificado" IS NOT NULL;
ALTER TABLE "capacitaciones" DROP COLUMN "certificado";
