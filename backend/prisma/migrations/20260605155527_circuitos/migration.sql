-- CreateTable
CREATE TABLE "circuitos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "circuitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fases" (
    "id" SERIAL NOT NULL,
    "circuito_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 10,
    "etiqueta_singular" VARCHAR(100),
    "etiqueta_plural" VARCHAR(100),
    "individual_paralelo" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_hora" BOOLEAN NOT NULL DEFAULT true,
    "ocultar_enviar_correo" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "en_vigor" BOOLEAN NOT NULL DEFAULT false,
    "obligatorio_todos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fases_participantes" (
    "id" SERIAL NOT NULL,
    "fase_id" INTEGER NOT NULL,
    "persona_id" INTEGER NOT NULL,

    CONSTRAINT "fases_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "circuitos_nombre_key" ON "circuitos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "fases_participantes_fase_id_persona_id_key" ON "fases_participantes"("fase_id", "persona_id");

-- AddForeignKey
ALTER TABLE "fases" ADD CONSTRAINT "fases_circuito_id_fkey" FOREIGN KEY ("circuito_id") REFERENCES "circuitos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fases_participantes" ADD CONSTRAINT "fases_participantes_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fases_participantes" ADD CONSTRAINT "fases_participantes_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
