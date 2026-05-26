-- CreateEnum
CREATE TYPE "TipoNivelCarpeta" AS ENUM ('LIBRERIA', 'AREA', 'SUBCARPETA');

-- CreateTable
CREATE TABLE "carpetas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoNivelCarpeta" NOT NULL DEFAULT 'SUBCARPETA',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "carpeta_padre_id" INTEGER,

    CONSTRAINT "carpetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "archivo_url" TEXT NOT NULL,
    "version" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "carpeta_id" INTEGER NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_relaciones" (
    "id" SERIAL NOT NULL,
    "doc_origen_id" INTEGER NOT NULL,
    "doc_destino_id" INTEGER NOT NULL,
    "tipo_relacion" TEXT,

    CONSTRAINT "documentos_relaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_carpetas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_carpetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpetas_permisos" (
    "id" SERIAL NOT NULL,
    "carpeta_id" INTEGER NOT NULL,
    "rol_carpeta_id" INTEGER NOT NULL,

    CONSTRAINT "carpetas_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carpetas_permisos_carpeta_id_rol_carpeta_id_key" ON "carpetas_permisos"("carpeta_id", "rol_carpeta_id");

-- AddForeignKey
ALTER TABLE "carpetas" ADD CONSTRAINT "carpetas_carpeta_padre_id_fkey" FOREIGN KEY ("carpeta_padre_id") REFERENCES "carpetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_carpeta_id_fkey" FOREIGN KEY ("carpeta_id") REFERENCES "carpetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_relaciones" ADD CONSTRAINT "documentos_relaciones_doc_origen_id_fkey" FOREIGN KEY ("doc_origen_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_relaciones" ADD CONSTRAINT "documentos_relaciones_doc_destino_id_fkey" FOREIGN KEY ("doc_destino_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas_permisos" ADD CONSTRAINT "carpetas_permisos_carpeta_id_fkey" FOREIGN KEY ("carpeta_id") REFERENCES "carpetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpetas_permisos" ADD CONSTRAINT "carpetas_permisos_rol_carpeta_id_fkey" FOREIGN KEY ("rol_carpeta_id") REFERENCES "roles_carpetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
