-- AlterTable
ALTER TABLE "configuracion_general" ADD COLUMN "ip_rangos_permitidos" VARCHAR(1000);

-- AlterTable
ALTER TABLE "sesion_activa" ADD COLUMN "en_espera" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sesion_activa" ADD COLUMN "aprobada_por_id" INTEGER;
ALTER TABLE "sesion_activa" ADD COLUMN "fecha_aprobacion" TIMESTAMPTZ;