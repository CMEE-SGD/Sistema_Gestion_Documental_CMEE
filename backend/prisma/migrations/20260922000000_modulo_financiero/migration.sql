-- Módulo financiero: proformas, facturas (XML), notas de entrega, pagos,
-- compensaciones y fechas de calibración (flujograma A→B→C→D).

-- ============ PROFORMAS ============
CREATE TYPE "EstadoProforma" AS ENUM ('EMITIDA', 'ACEPTADA', 'VENCIDA', 'CANCELADA');

CREATE TABLE "proformas" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_emision" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoProforma" NOT NULL DEFAULT 'EMITIDA',
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proformas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "proformas_numero_key" ON "proformas"("numero");
CREATE INDEX "proformas_cliente_id_idx" ON "proformas"("cliente_id");
ALTER TABLE "proformas" ADD CONSTRAINT "proformas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_institucionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Vínculo opcional orden de trabajo → proforma
ALTER TABLE "ordenes_trabajo" ADD COLUMN "proforma_id" INTEGER;
CREATE INDEX "ordenes_trabajo_proforma_id_idx" ON "ordenes_trabajo"("proforma_id");
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_proforma_id_fkey" FOREIGN KEY ("proforma_id") REFERENCES "proformas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============ FECHAS DE CALIBRACIÓN (Fase A y D) ============
ALTER TABLE "equipos_recepcion" ADD COLUMN "fecha_calibracion" DATE;
ALTER TABLE "equipos_recepcion" ADD COLUMN "fecha_proxima_calibracion" DATE;

-- ============ FACTURAS ============
CREATE TYPE "EstadoFactura" AS ENUM ('EMITIDA', 'PARCIAL', 'PAGADA', 'ANULADA');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'COMPENSACION');

CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "clave_acceso" VARCHAR(100),
    "ruta_xml" VARCHAR(500),
    "nombre_original_xml" VARCHAR(255),
    "cliente_id" INTEGER NOT NULL,
    "razon_social_cliente" VARCHAR(200),
    "ruc_cliente" VARCHAR(20),
    "fecha_emision" DATE NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "plazo_dias" INTEGER NOT NULL DEFAULT 30,
    "fecha_vencimiento" DATE NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'EMITIDA',
    "notas" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "facturas_numero_key" ON "facturas"("numero");
CREATE UNIQUE INDEX "facturas_clave_acceso_key" ON "facturas"("clave_acceso");
CREATE INDEX "facturas_cliente_id_idx" ON "facturas"("cliente_id");
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");
CREATE INDEX "facturas_fecha_vencimiento_idx" ON "facturas"("fecha_vencimiento");
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_institucionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "factura_detalle" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "concepto" VARCHAR(300) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "equipo_recepcion_id" INTEGER,
    CONSTRAINT "factura_detalle_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "factura_detalle_factura_id_idx" ON "factura_detalle"("factura_id");
CREATE INDEX "factura_detalle_equipo_recepcion_id_idx" ON "factura_detalle"("equipo_recepcion_id");
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_equipo_recepcion_id_fkey" FOREIGN KEY ("equipo_recepcion_id") REFERENCES "equipos_recepcion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============ NOTAS DE ENTREGA ============
CREATE TABLE "notas_entrega" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregado_por_id" INTEGER,
    "recibido_por" VARCHAR(150),
    "fecha_entrega" DATE,
    "observaciones" TEXT,
    CONSTRAINT "notas_entrega_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notas_entrega_numero_key" ON "notas_entrega"("numero");
CREATE INDEX "notas_entrega_factura_id_idx" ON "notas_entrega"("factura_id");
ALTER TABLE "notas_entrega" ADD CONSTRAINT "notas_entrega_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notas_entrega" ADD CONSTRAINT "notas_entrega_entregado_por_id_fkey" FOREIGN KEY ("entregado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============ COMPENSACIONES (pago con entrega de equipos) ============
CREATE TABLE "compensaciones" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "descripcion_equipo" VARCHAR(300),
    "autorizacion_previa" BOOLEAN NOT NULL DEFAULT false,
    "ruta_factura_compra" VARCHAR(500),
    "ruta_acta" VARCHAR(500),
    "descuento_autorizado" DECIMAL(12,2),
    "observaciones" TEXT,
    CONSTRAINT "compensaciones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "compensaciones_factura_id_idx" ON "compensaciones"("factura_id");
ALTER TABLE "compensaciones" ADD CONSTRAINT "compensaciones_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============ PAGOS ============
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" "MetodoPago" NOT NULL,
    "ruta_comprobante" VARCHAR(500),
    "nombre_original_comprobante" VARCHAR(255),
    "referencia" VARCHAR(100),
    "observaciones" TEXT,
    "compensacion_id" INTEGER,
    "registrado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pagos_factura_id_idx" ON "pagos"("factura_id");
CREATE INDEX "pagos_compensacion_id_idx" ON "pagos"("compensacion_id");
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_compensacion_id_fkey" FOREIGN KEY ("compensacion_id") REFERENCES "compensaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;