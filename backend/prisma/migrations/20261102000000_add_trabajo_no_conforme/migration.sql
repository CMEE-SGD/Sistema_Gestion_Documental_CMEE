-- CreateEnum
CREATE TYPE "CategoriaTrabajoNC" AS ENUM ('EQUIPO', 'INSUMOS', 'MATERIAL', 'SERVICIO_CONTRATADO', 'CALIBRACION', 'ENSAYO', 'CERTIFICADO', 'REPORTE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoTrabajoNC" AS ENUM ('REGISTRADA', 'EN_TRATAMIENTO', 'EN_SEGUIMIENTO', 'CERRADA');

-- CreateTable
CREATE TABLE "trabajo_no_conforme" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "elaborado_por" VARCHAR(150) NOT NULL,
    "fecha" DATE NOT NULL,
    "categoria" "CategoriaTrabajoNC" NOT NULL DEFAULT 'EQUIPO',
    "descripcion_problema" TEXT NOT NULL,
    "tratamiento_responsable" VARCHAR(150),
    "tratamiento_fecha" DATE,
    "acciones_tomadas" JSONB,
    "tratamiento_descripcion" TEXT,
    "requiere_accion_correctiva" BOOLEAN NOT NULL DEFAULT false,
    "accion_correctiva_num" VARCHAR(50),
    "requiere_accion_preventiva" BOOLEAN NOT NULL DEFAULT false,
    "accion_preventiva_num" VARCHAR(50),
    "seguimiento_responsable" VARCHAR(150),
    "seguimiento_fecha" DATE,
    "eficaz" BOOLEAN,
    "eficacia_verificada" TEXT,
    "observaciones" TEXT,
    "cerrado_por" VARCHAR(150),
    "fecha_cierre" DATE,
    "estado" "EstadoTrabajoNC" NOT NULL DEFAULT 'REGISTRADA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "trabajo_no_conforme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trabajo_no_conforme_codigo_key" ON "trabajo_no_conforme"("codigo");
