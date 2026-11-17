-- Nota de entrega de la orden (formato AC1.2.F2-1): una por orden, se llena en
-- el aplicativo, se imprime y se firma en papel. Solo agrega tablas y tipos.
CREATE TYPE "CondicionCalibracion" AS ENUM ('CALIBRADO', 'SIN_CALIBRAR');
CREATE TYPE "CondicionCertificado" AS ENUM ('CON_CERTIFICADO', 'SIN_CERTIFICADO');

CREATE TABLE "notas_entrega_orden" (
    "id" SERIAL NOT NULL,
    "orden_trabajo_id" INTEGER NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "fecha_egreso" DATE NOT NULL,
    "cliente" VARCHAR(200) NOT NULL,
    "representante" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(250) NOT NULL,
    "telefono" VARCHAR(40) NOT NULL,
    "observaciones" TEXT,
    "envio_empresa" VARCHAR(150),
    "envio_destinatario" VARCHAR(150),
    "envio_ciudad" VARCHAR(100),
    "envio_guia" VARCHAR(100),
    "envio_fecha" DATE,
    "envio_factura_cmee" VARCHAR(50),
    "cliente_firma_nombre" VARCHAR(150),
    "cliente_firma_ci" VARCHAR(20),
    "cmee_firma_nombre" VARCHAR(150),
    "cmee_firma_ci" VARCHAR(20),
    "creada_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notas_entrega_orden_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notas_entrega_orden_equipos" (
    "id" SERIAL NOT NULL,
    "nota_entrega_id" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "equipo" VARCHAR(200) NOT NULL,
    "marca" VARCHAR(100),
    "modelo" VARCHAR(100),
    "serie_codigo" VARCHAR(100),
    "accesorios" VARCHAR(300),
    "calibracion" "CondicionCalibracion",
    "certificado" "CondicionCertificado",
    "informe" VARCHAR(150),

    CONSTRAINT "notas_entrega_orden_equipos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notas_entrega_orden_orden_trabajo_id_key" ON "notas_entrega_orden"("orden_trabajo_id");
CREATE UNIQUE INDEX "notas_entrega_orden_numero_key" ON "notas_entrega_orden"("numero");
CREATE UNIQUE INDEX "notas_entrega_orden_equipos_nota_entrega_id_orden_key" ON "notas_entrega_orden_equipos"("nota_entrega_id", "orden");

ALTER TABLE "notas_entrega_orden" ADD CONSTRAINT "notas_entrega_orden_orden_trabajo_id_fkey" FOREIGN KEY ("orden_trabajo_id") REFERENCES "ordenes_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notas_entrega_orden" ADD CONSTRAINT "notas_entrega_orden_creada_por_id_fkey" FOREIGN KEY ("creada_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notas_entrega_orden_equipos" ADD CONSTRAINT "notas_entrega_orden_equipos_nota_entrega_id_fkey" FOREIGN KEY ("nota_entrega_id") REFERENCES "notas_entrega_orden"("id") ON DELETE CASCADE ON UPDATE CASCADE;
