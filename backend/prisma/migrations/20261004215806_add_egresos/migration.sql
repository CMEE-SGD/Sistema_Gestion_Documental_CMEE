-- CreateTable
CREATE TABLE "egresos" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "tipo_documento" VARCHAR(100) NOT NULL,
    "numero_documento" VARCHAR(100) NOT NULL,
    "numero_documento_relacionado" VARCHAR(100),
    "autorizacion" VARCHAR(500),
    "proveedor" VARCHAR(255) NOT NULL,
    "identificacion" VARCHAR(50),
    "referencia" VARCHAR(255),
    "subtotal_iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal_cero" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "retenciones" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'Pagado',
    "dias_vencimiento" INTEGER,
    "fecha_vencimiento" DATE,
    "forma_pago" VARCHAR(50),
    "tipo_emision" VARCHAR(50),
    "descripcion" TEXT,
    "registrado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "egresos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "egresos_fecha_idx" ON "egresos"("fecha");

-- CreateIndex
CREATE INDEX "egresos_estado_idx" ON "egresos"("estado");

-- AddForeignKey
ALTER TABLE "egresos" ADD CONSTRAINT "egresos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;