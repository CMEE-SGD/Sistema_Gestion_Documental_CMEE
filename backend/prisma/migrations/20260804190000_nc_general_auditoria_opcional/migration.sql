-- DropForeignKey
ALTER TABLE "no_conformidad" DROP CONSTRAINT "no_conformidad_auditoria_id_fkey";

-- DropIndex
DROP INDEX "no_conformidad_auditoria_id_codigo_key";

-- AlterTable
ALTER TABLE "no_conformidad" ALTER COLUMN "auditoria_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "no_conformidad_codigo_key" ON "no_conformidad"("codigo");

-- AddForeignKey
ALTER TABLE "no_conformidad" ADD CONSTRAINT "no_conformidad_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditoria_interna"("id") ON DELETE SET NULL ON UPDATE CASCADE;