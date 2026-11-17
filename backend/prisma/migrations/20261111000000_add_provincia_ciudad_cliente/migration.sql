-- Ubicación del cliente (provincia y ciudad) para el mapa de calor del módulo
-- Resumen. Solo agrega columnas nulas; los clientes existentes se completan a mano.
ALTER TABLE "clientes_institucionales" ADD COLUMN "provincia" VARCHAR(50);
ALTER TABLE "clientes_institucionales" ADD COLUMN "ciudad" VARCHAR(100);
