-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('MILITAR', 'CIVIL');

-- CreateEnum
CREATE TYPE "EstadoRecepcion" AS ENUM ('EN_ESPERA', 'EN_CALIBRACION', 'FINALIZADO');

-- CreateTable
CREATE TABLE "clientes_institucionales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo" "TipoCliente" NOT NULL DEFAULT 'CIVIL',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_institucionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepcion_equipos" (
    "id" SERIAL NOT NULL,
    "orden_trabajo_fisica" VARCHAR(50) NOT NULL,
    "fecha_ingreso" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" INTEGER NOT NULL,
    "equipo_descripcion" VARCHAR(200) NOT NULL,
    "codigo_serie" VARCHAR(100),
    "laboratorio_id" INTEGER NOT NULL,
    "estado" "EstadoRecepcion" NOT NULL DEFAULT 'EN_ESPERA',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "recepcion_equipos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_institucionales_nombre_key" ON "clientes_institucionales"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "recepcion_equipos_orden_trabajo_fisica_key" ON "recepcion_equipos"("orden_trabajo_fisica");

-- AddForeignKey
ALTER TABLE "recepcion_equipos" ADD CONSTRAINT "recepcion_equipos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_institucionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_equipos" ADD CONSTRAINT "recepcion_equipos_laboratorio_id_fkey" FOREIGN KEY ("laboratorio_id") REFERENCES "laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
