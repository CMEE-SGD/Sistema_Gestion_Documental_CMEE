-- CreateTable
CREATE TABLE "sesion_activa" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_jti" VARCHAR(100) NOT NULL,
    "ip" VARCHAR(45),
    "user_agent" VARCHAR(300),
    "fecha_inicio" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMPTZ NOT NULL,
    "fecha_cierre" TIMESTAMPTZ,
    "cerrada_por_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sesion_activa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesion_activa_token_jti_key" ON "sesion_activa"("token_jti");

-- CreateIndex
CREATE INDEX "sesion_activa_usuario_id_idx" ON "sesion_activa"("usuario_id");

-- AddForeignKey
ALTER TABLE "sesion_activa" ADD CONSTRAINT "sesion_activa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;