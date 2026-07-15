-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "entidad_id" INTEGER;

-- CreateTable
CREATE TABLE "intento_login" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" VARCHAR(80) NOT NULL,
    "exito" BOOLEAN NOT NULL,
    "motivo_fallo" VARCHAR(100),
    "ip" VARCHAR(45),
    "usuario_id" INTEGER,
    "fecha_hora" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intento_login_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intento_login_nombre_usuario_idx" ON "intento_login"("nombre_usuario");

-- CreateIndex
CREATE INDEX "intento_login_usuario_id_idx" ON "intento_login"("usuario_id");

-- CreateIndex
CREATE INDEX "intento_login_fecha_hora_idx" ON "intento_login"("fecha_hora");

-- CreateIndex
CREATE INDEX "auditoria_modulo_entidad_id_idx" ON "auditoria"("modulo", "entidad_id");

-- AddForeignKey
ALTER TABLE "intento_login" ADD CONSTRAINT "intento_login_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

