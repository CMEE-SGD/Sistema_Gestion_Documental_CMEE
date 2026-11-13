-- Un mismo equipo calibrado en varios laboratorios: cada laboratorio tiene su
-- propia fila (flujo, técnico, certificado y firmas) enlazada a la principal.
-- Solo agrega una columna opcional, un índice y su clave foránea.
ALTER TABLE "equipos_recepcion" ADD COLUMN "equipo_principal_id" INTEGER;

CREATE INDEX "equipos_recepcion_equipo_principal_id_idx" ON "equipos_recepcion"("equipo_principal_id");

ALTER TABLE "equipos_recepcion" ADD CONSTRAINT "equipos_recepcion_equipo_principal_id_fkey" FOREIGN KEY ("equipo_principal_id") REFERENCES "equipos_recepcion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
