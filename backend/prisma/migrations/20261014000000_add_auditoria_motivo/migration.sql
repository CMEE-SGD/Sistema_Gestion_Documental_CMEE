-- Motivo (texto libre) que la persona indica al editar o eliminar un recurso.
-- Columna opcional y sin valor por defecto: en PostgreSQL agregarla es
-- instantáneo (no reescribe la tabla) y las filas anteriores quedan en NULL.
ALTER TABLE "auditoria" ADD COLUMN "motivo" TEXT;
