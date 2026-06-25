-- CreateEnum
CREATE TYPE "EstadoAdministrativo" AS ENUM ('RECIBIDO', 'EN_PROCESO', 'OBSERVADO', 'APROBADO', 'FINALIZADO', 'ARCHIVADO');

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "identificacion" VARCHAR(20) NOT NULL,
    "nombre_razon" VARCHAR(200) NOT NULL,
    "tipo_cliente" VARCHAR(50) NOT NULL,
    "contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "correo" VARCHAR(100),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud" (
    "id" SERIAL NOT NULL,
    "codigo_tramite" VARCHAR(50) NOT NULL,
    "fecha_ingreso" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" INTEGER NOT NULL,
    "laboratorio_id" INTEGER,
    "estado" "EstadoAdministrativo" NOT NULL DEFAULT 'RECIBIDO',
    "descripcion" TEXT NOT NULL,
    "observaciones" TEXT,
    "creado_por_id" INTEGER NOT NULL,
    "asignado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_identificacion_key" ON "cliente"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_codigo_tramite_key" ON "solicitud"("codigo_tramite");

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_asignado_por_id_fkey" FOREIGN KEY ("asignado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
