-- Auditorías adicionales a las programadas (MC22 22.5.2)
-- El área técnica complementa las auditorías del programa cuando se introduce
-- un cambio significativo en el SGC, cuando hay sospecha o certeza de
-- incumplimiento, o cuando la implantación de una acción correctiva puede no
-- ser eficaz.
CREATE TYPE "MotivoAuditoriaAdicional" AS ENUM (
    'CAMBIO_SIGNIFICATIVO_SGC',
    'SOSPECHA_INCUMPLIMIENTO',
    'IMPLANTACION_AC_EFFICACIDAD'
);

-- Sólo aplica a auditorías internas (las evaluaciones de OEC siguen otro circuito).
ALTER TABLE "auditoria_interna"
    ADD COLUMN "adicional" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "motivo_adicional" "MotivoAuditoriaAdicional",
    ADD COLUMN "detalle_adicional" TEXT;
