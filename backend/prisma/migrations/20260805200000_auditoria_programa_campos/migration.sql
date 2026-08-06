-- AlterTable
ALTER TABLE "auditoria_interna" ADD COLUMN "descripcion" TEXT,
ADD COLUMN "objeto" TEXT,
ADD COLUMN "documentos_referencia" JSONB,
ADD COLUMN "responsable_auditoria" TEXT,
ADD COLUMN "equipo_auditor" JSONB,
ADD COLUMN "cronograma" JSONB,
ADD COLUMN "testificaciones" JSONB;
