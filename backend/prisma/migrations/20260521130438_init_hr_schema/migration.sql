-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "funciones" TEXT,
    "educacion_indispensable" TEXT,
    "educacion_deseable" TEXT,
    "formacion_indispensable" TEXT,
    "formacion_deseable" TEXT,
    "capacidades_indispensable" TEXT,
    "capacidades_deseable" TEXT,
    "experiencia_indispensable" TEXT,
    "experiencia_deseable" TEXT,
    "orden" SMALLINT DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamento" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'Departamento',
    "sede" VARCHAR(150),
    "descripcion" TEXT,
    "dependencia_id" INTEGER,
    "responsable_id" INTEGER,
    "sustituto_id" INTEGER,
    "orden" SMALLINT DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puesto" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "educacion" TEXT,
    "formacion" TEXT,
    "habilidad" TEXT,
    "experiencia" TEXT,
    "conocimiento_tecnico" TEXT,
    "calificacion" TEXT,
    "autoridad" TEXT,
    "responsabilidades" TEXT,
    "funcion_principal" TEXT,
    "funciones_alternas" TEXT,
    "funciones" TEXT,
    "perfil_educacion_indispensable" TEXT,
    "perfil_formacion_deseable" TEXT,
    "perfil_capacidades_deseable" TEXT,
    "perfil_experiencia_deseable" TEXT,
    "dependencia_id" INTEGER,
    "sustituto_id" INTEGER,
    "orden" SMALLINT DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_ultima_mod" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "puesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30),
    "saludo" VARCHAR(10),
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "cedula_identidad" VARCHAR(20),
    "fecha_nacimiento" DATE,
    "sexo" CHAR(1),
    "domicilio" VARCHAR(250),
    "ciudad" VARCHAR(100),
    "codigo_postal" VARCHAR(15),
    "provincia" VARCHAR(100),
    "telefono" VARCHAR(20),
    "fax" VARCHAR(20),
    "celular" VARCHAR(20),
    "email_1" VARCHAR(150),
    "email_2" VARCHAR(150),
    "foto_ruta" VARCHAR(500),
    "hoja_vida_ruta" VARCHAR(500),
    "tipo_recurso" VARCHAR(50) DEFAULT 'Usuario del sistema',
    "fecha_alta" DATE NOT NULL DEFAULT CURRENT_DATE,
    "idioma" VARCHAR(50) DEFAULT 'Idioma por defecto del centro',
    "departamento_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "nombre_usuario" VARCHAR(80) NOT NULL,
    "perfil_sistema" VARCHAR(100),
    "interfaz" VARCHAR(50),
    "password_hash" VARCHAR(255) NOT NULL,
    "estado_cuenta" BOOLEAN NOT NULL DEFAULT true,
    "rol_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_puesto" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "puesto_id" INTEGER NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "orden_puesto" SMALLINT NOT NULL,
    "fecha_asignacion" DATE NOT NULL DEFAULT CURRENT_DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_puesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento_persona" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(300) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "tipo_documento" VARCHAR(100),
    "fecha_subida" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "documento_persona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_codigo_key" ON "rol"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "departamento_codigo_key" ON "departamento"("codigo");

-- CreateIndex
CREATE INDEX "departamento_dependencia_id_idx" ON "departamento"("dependencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "puesto_codigo_key" ON "puesto"("codigo");

-- CreateIndex
CREATE INDEX "puesto_dependencia_id_idx" ON "puesto"("dependencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "persona_codigo_key" ON "persona"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "persona_cedula_identidad_key" ON "persona"("cedula_identidad");

-- CreateIndex
CREATE INDEX "persona_departamento_id_idx" ON "persona"("departamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_persona_id_key" ON "usuario"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_nombre_usuario_key" ON "usuario"("nombre_usuario");

-- CreateIndex
CREATE INDEX "usuario_rol_id_idx" ON "usuario"("rol_id");

-- CreateIndex
CREATE INDEX "usuario_nombre_usuario_idx" ON "usuario"("nombre_usuario");

-- CreateIndex
CREATE INDEX "persona_puesto_persona_id_idx" ON "persona_puesto"("persona_id");

-- CreateIndex
CREATE INDEX "persona_puesto_puesto_id_idx" ON "persona_puesto"("puesto_id");

-- CreateIndex
CREATE UNIQUE INDEX "persona_puesto_persona_id_puesto_id_key" ON "persona_puesto"("persona_id", "puesto_id");

-- CreateIndex
CREATE UNIQUE INDEX "persona_puesto_persona_id_orden_puesto_key" ON "persona_puesto"("persona_id", "orden_puesto");

-- CreateIndex
CREATE INDEX "documento_persona_persona_id_idx" ON "documento_persona"("persona_id");

-- AddForeignKey
ALTER TABLE "departamento" ADD CONSTRAINT "departamento_dependencia_id_fkey" FOREIGN KEY ("dependencia_id") REFERENCES "departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamento" ADD CONSTRAINT "departamento_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamento" ADD CONSTRAINT "departamento_sustituto_id_fkey" FOREIGN KEY ("sustituto_id") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puesto" ADD CONSTRAINT "puesto_dependencia_id_fkey" FOREIGN KEY ("dependencia_id") REFERENCES "puesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puesto" ADD CONSTRAINT "puesto_sustituto_id_fkey" FOREIGN KEY ("sustituto_id") REFERENCES "puesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona" ADD CONSTRAINT "persona_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_puesto" ADD CONSTRAINT "persona_puesto_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_puesto" ADD CONSTRAINT "persona_puesto_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_puesto" ADD CONSTRAINT "persona_puesto_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_persona" ADD CONSTRAINT "documento_persona_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- TRIGGER: Validar máximo 3 puestos por persona
-- ============================================================
CREATE OR REPLACE FUNCTION fn_validar_max_puestos()
RETURNS TRIGGER AS $$
DECLARE
    total INT;
BEGIN
    SELECT COUNT(*) INTO total
    FROM persona_puesto
    WHERE persona_id = NEW.persona_id
      AND activo = TRUE;

    IF total >= 3 THEN
        RAISE EXCEPTION 'Una persona no puede tener más de 3 puestos asignados. (persona_id: %)', NEW.persona_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_puestos
    BEFORE INSERT ON persona_puesto
    FOR EACH ROW EXECUTE FUNCTION fn_validar_max_puestos();

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rol_updated_at
    BEFORE UPDATE ON rol
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_departamento_updated_at
    BEFORE UPDATE ON departamento
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_puesto_updated_at
    BEFORE UPDATE ON puesto
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_persona_updated_at
    BEFORE UPDATE ON persona
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();