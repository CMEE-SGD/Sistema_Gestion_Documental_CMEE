-- AlterEnum
BEGIN;
CREATE TYPE "EstadoRecepcion_new" AS ENUM ('EN_ESPERA', 'EN_CALIBRACION', 'REVISION_OBT', 'PENDIENTE_FIRMA_TECNICO', 'REVISION_JEFE', 'REVISION_DIRECTOR', 'LISTO_PARA_ENTREGA', 'FINALIZADO');
ALTER TABLE "equipos_recepcion" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "equipos_recepcion" ALTER COLUMN "estado" TYPE "EstadoRecepcion_new" USING ("estado"::text::"EstadoRecepcion_new");
ALTER TABLE "historial_estado" ALTER COLUMN "estado_anterior" TYPE "EstadoRecepcion_new" USING ("estado_anterior"::text::"EstadoRecepcion_new");
ALTER TABLE "historial_estado" ALTER COLUMN "estado_nuevo" TYPE "EstadoRecepcion_new" USING ("estado_nuevo"::text::"EstadoRecepcion_new");
ALTER TYPE "EstadoRecepcion" RENAME TO "EstadoRecepcion_old";
ALTER TYPE "EstadoRecepcion_new" RENAME TO "EstadoRecepcion";
DROP TYPE "EstadoRecepcion_old";
ALTER TABLE "equipos_recepcion" ALTER COLUMN "estado" SET DEFAULT 'EN_ESPERA';
COMMIT;
