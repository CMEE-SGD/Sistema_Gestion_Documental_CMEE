-- Add plan file fields to riesgo_oportunidad
ALTER TABLE "riesgo_oportunidad" ADD COLUMN IF NOT EXISTS "plan_archivo" VARCHAR(500);
ALTER TABLE "riesgo_oportunidad" ADD COLUMN IF NOT EXISTS "plan_nombre" VARCHAR(255);
