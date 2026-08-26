-- AlterTable: nombre pasó a ser opcional en schema.prisma (el PR #25 movió el
-- campo obligatorio a `magnitud`), pero nunca se genero la migracion para
-- reflejarlo en la base de datos real -- la columna seguia exigiendo NOT NULL.
ALTER TABLE "servicio" ALTER COLUMN "nombre" DROP NOT NULL;
