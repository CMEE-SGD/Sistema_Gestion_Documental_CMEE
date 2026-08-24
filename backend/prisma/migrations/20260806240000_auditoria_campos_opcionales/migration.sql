-- AlterTable: auditoría EXTERNA (formulario SAE) no exige alcance ni responsable
ALTER TABLE "auditoria_interna" ALTER COLUMN "alcance" DROP NOT NULL,
ALTER COLUMN "responsable_id" DROP NOT NULL;
