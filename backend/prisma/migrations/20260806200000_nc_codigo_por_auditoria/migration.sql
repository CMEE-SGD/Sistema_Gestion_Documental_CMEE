-- La numeración de NC es por auditoría: cada auditoría inicia en 1.
-- Se elimina el único global sobre codigo y se crea un único compuesto
-- (auditoria_id, codigo). Las NC sin auditoría (auditoria_id IS NULL) quedan
-- fuera del restringido por NULLS DISTINCT y se controlan en el servicio.

-- DropIndex
DROP INDEX "no_conformidad_codigo_key";

-- CreateIndex
CREATE UNIQUE INDEX "uq_no_conformidad_auditoria_codigo" ON "no_conformidad"("auditoria_id", "codigo");

-- Renumerar las NC existentes partiendo en 1 dentro de cada auditoría
-- (mantiene el orden por id; las NC sin auditoría quedan numeradas en su propio grupo)
UPDATE "no_conformidad" n
SET "codigo" = sub.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "auditoria_id" ORDER BY "id")::text AS rn
  FROM "no_conformidad"
) sub
WHERE n."id" = sub."id";
