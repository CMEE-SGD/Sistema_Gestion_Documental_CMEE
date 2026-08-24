/*
  Warnings:

  - You are about to drop the column `interfaz` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `perfil_sistema` on the `usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "interfaz",
DROP COLUMN "perfil_sistema",
ADD COLUMN     "acceso_chat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceso_preferencias" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bloqueado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cambiar_clave_proxima_sesion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_caducidad" DATE,
ADD COLUMN     "idioma" VARCHAR(50);

-- CreateTable
CREATE TABLE "grupo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UsuarioGrupos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "grupo_nombre_key" ON "grupo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_UsuarioGrupos_AB_unique" ON "_UsuarioGrupos"("A", "B");

-- CreateIndex
CREATE INDEX "_UsuarioGrupos_B_index" ON "_UsuarioGrupos"("B");

-- AddForeignKey
ALTER TABLE "_UsuarioGrupos" ADD CONSTRAINT "_UsuarioGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioGrupos" ADD CONSTRAINT "_UsuarioGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
