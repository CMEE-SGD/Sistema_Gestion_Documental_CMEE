-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('UNIDAD', 'CAJA', 'KIT', 'KG', 'G', 'L', 'ML', 'M');

-- CreateEnum
CREATE TYPE "TipoMovimientoInventario" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "MotivoMovimiento" AS ENUM ('COMPRA', 'CONSUMO_LABORATORIO', 'MERMA', 'DEVOLUCION', 'AJUSTE_INVENTARIO', 'OTRO');

-- CreateTable
CREATE TABLE "categorias_insumo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categorias_insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_inventario" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "unidad" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
    "categoria_id" INTEGER NOT NULL,
    "stock_actual" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "ubicacion" VARCHAR(150),
    "fecha_ultimo_mov" TIMESTAMPTZ,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "productos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "motivo" "MotivoMovimiento" NOT NULL DEFAULT 'CONSUMO_LABORATORIO',
    "cantidad" DECIMAL(12,3) NOT NULL,
    "stock_anterior" DECIMAL(12,3) NOT NULL,
    "stock_posterior" DECIMAL(12,3) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrado_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_insumo_nombre_key" ON "categorias_insumo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_inventario_codigo_key" ON "productos_inventario"("codigo");

-- CreateIndex
CREATE INDEX "productos_inventario_categoria_id_idx" ON "productos_inventario"("categoria_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_producto_id_idx" ON "movimientos_inventario"("producto_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_idx" ON "movimientos_inventario"("fecha");

-- AddForeignKey
ALTER TABLE "productos_inventario" ADD CONSTRAINT "productos_inventario_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
