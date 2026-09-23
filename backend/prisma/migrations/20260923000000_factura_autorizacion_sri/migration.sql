-- Absorber la autorización SRI completa en la factura: el XML con el que se
-- trabaja llega como <autorizacion> (estado, numeroAutorizacion,
-- fechaAutorizacion, ambiente) y el comprobante dentro de CDATA. Se guardan
-- también los campos adicionales (p. ej. "RUC Proveedor" en re-facturaciones).

ALTER TABLE "facturas" ADD COLUMN "numero_autorizacion" VARCHAR(100);
ALTER TABLE "facturas" ADD COLUMN "fecha_autorizacion" TIMESTAMPTZ;
ALTER TABLE "facturas" ADD COLUMN "ambiente" VARCHAR(20);
ALTER TABLE "facturas" ADD COLUMN "info_adicional" JSONB;