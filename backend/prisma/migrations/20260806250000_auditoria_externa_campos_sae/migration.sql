-- Campos adicionales del Plan de Evaluación Externa (SAE)
ALTER TABLE "auditoria_interna" ADD COLUMN "email_oec" VARCHAR(200),
ADD COLUMN "ciudad_pais" VARCHAR(200),
ADD COLUMN "telefono_oec" VARCHAR(200),
ADD COLUMN "direccion_oficina" TEXT,
ADD COLUMN "localizaciones_criticas" TEXT,
ADD COLUMN "tipo_evaluacion" JSON,
ADD COLUMN "fecha_evaluacion_anterior" VARCHAR(100),
ADD COLUMN "fecha_testificacion" VARCHAR(100),
ADD COLUMN "localizaciones_evaluacion" TEXT,
ADD COLUMN "numero_sae" VARCHAR(50),
ADD COLUMN "fecha_elaboracion" DATE,
ADD COLUMN "elaborado_por" VARCHAR(150);
