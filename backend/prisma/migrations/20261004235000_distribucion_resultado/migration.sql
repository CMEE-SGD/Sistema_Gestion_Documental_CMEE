-- CreateTable
CREATE TABLE "distribucion_resultado" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "habilitada" BOOLEAN NOT NULL DEFAULT true,
    "empresa_a_nombre" VARCHAR(120) NOT NULL,
    "empresa_a_porcentaje" DECIMAL(5,2) NOT NULL,
    "empresa_b_nombre" VARCHAR(120) NOT NULL,
    "empresa_b_porcentaje" DECIMAL(5,2) NOT NULL,
    "base" VARCHAR(20) NOT NULL DEFAULT 'neto',
    "nota" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "distribucion_resultado_pkey" PRIMARY KEY ("id")
);