-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "puesto_afectado_id" INTEGER,
ADD COLUMN     "rol_afectado_id" INTEGER;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_rol_afectado_id_fkey" FOREIGN KEY ("rol_afectado_id") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_puesto_afectado_id_fkey" FOREIGN KEY ("puesto_afectado_id") REFERENCES "puesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
