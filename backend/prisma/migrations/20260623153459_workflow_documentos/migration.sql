-- CreateEnum
CREATE TYPE "EstadoWorkflow" AS ENUM ('EN_CURSO', 'COMPLETADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoFaseWorkflow" AS ENUM ('PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "documentos_workflow" (
    "id" SERIAL NOT NULL,
    "documento_id" INTEGER NOT NULL,
    "circuito_id" INTEGER NOT NULL,
    "estado" "EstadoWorkflow" NOT NULL DEFAULT 'EN_CURSO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_workflow_fases" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "fase_id" INTEGER NOT NULL,
    "estado" "EstadoFaseWorkflow" NOT NULL DEFAULT 'PENDIENTE',
    "archivo_url" TEXT,
    "procesado_por" VARCHAR(150),
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_workflow_fases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentos_workflow_documento_id_key" ON "documentos_workflow"("documento_id");

-- AddForeignKey
ALTER TABLE "documentos_workflow" ADD CONSTRAINT "documentos_workflow_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_workflow" ADD CONSTRAINT "documentos_workflow_circuito_id_fkey" FOREIGN KEY ("circuito_id") REFERENCES "circuitos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_workflow_fases" ADD CONSTRAINT "documentos_workflow_fases_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "documentos_workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_workflow_fases" ADD CONSTRAINT "documentos_workflow_fases_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
