-- AlterTable
ALTER TABLE "configuracion_general" ALTER COLUMN "tiempo_inactividad_minutos" SET DEFAULT 5;

-- Actualiza también el valor ya guardado (el DEFAULT de la columna solo
-- aplica a filas nuevas; esta tabla es un singleton con la fila "id = 1"
-- ya creada, así que sin este UPDATE seguiría en 20 o en lo que sea que
-- ya tuviera).
UPDATE "configuracion_general" SET "tiempo_inactividad_minutos" = 5 WHERE "id" = 1;
