-- CreateTable
CREATE TABLE "configuracion_general" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre_institucion" VARCHAR(200) NOT NULL,
    "max_intentos_fallidos_login" SMALLINT NOT NULL DEFAULT 5,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "configuracion_general_pkey" PRIMARY KEY ("id")
);

-- Seed inicial (fila única, id=1)
INSERT INTO "configuracion_general" ("id", "nombre_institucion", "max_intentos_fallidos_login", "updated_at")
VALUES (1, 'Centro de Metrología del Ejército Ecuatoriano', 5, CURRENT_TIMESTAMP);
