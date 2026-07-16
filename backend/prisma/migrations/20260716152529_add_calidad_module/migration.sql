-- CreateEnum
CREATE TYPE "TipoAuditoria" AS ENUM ('INTERNA', 'EXTERNA');

-- CreateEnum
CREATE TYPE "EstadoAuditoria" AS ENUM ('PLANIFICADA', 'EN_CURSO', 'CERRADA');

-- CreateEnum
CREATE TYPE "ClasificacionNC" AS ENUM ('MENOR', 'MAYOR', 'CRITICA');

-- CreateEnum
CREATE TYPE "EstadoNC" AS ENUM ('ABIERTA', 'EN_CURSO', 'CERRADA', 'VERIFICADA');

-- CreateTable
CREATE TABLE "auditoria_interna" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "tipo" "TipoAuditoria" NOT NULL DEFAULT 'INTERNA',
    "alcance" TEXT NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "responsable_id" INTEGER NOT NULL,
    "estado" "EstadoAuditoria" NOT NULL DEFAULT 'PLANIFICADA',
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "auditoria_interna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "no_conformidad" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "auditoria_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requisito_incumplido" VARCHAR(500),
    "clasificacion" "ClasificacionNC" NOT NULL DEFAULT 'MENOR',
    "causa_raiz" TEXT,
    "acciones_inmediatas" TEXT,
    "estado" "EstadoNC" NOT NULL DEFAULT 'ABIERTA',
    "responsable_id" INTEGER,
    "fecha_cierre" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "no_conformidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auditoria_interna_codigo_key" ON "auditoria_interna"("codigo");

-- CreateIndex
CREATE INDEX "auditoria_interna_responsable_id_idx" ON "auditoria_interna"("responsable_id");

-- CreateIndex
CREATE UNIQUE INDEX "no_conformidad_codigo_key" ON "no_conformidad"("codigo");

-- CreateIndex
CREATE INDEX "no_conformidad_auditoria_id_idx" ON "no_conformidad"("auditoria_id");

-- AddForeignKey
ALTER TABLE "auditoria_interna" ADD CONSTRAINT "auditoria_interna_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_conformidad" ADD CONSTRAINT "no_conformidad_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditoria_interna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "no_conformidad" ADD CONSTRAINT "no_conformidad_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
