-- =====================================================================
-- SCRIPT DE INSERCIÓN UNIFICADO CMEE_BD
-- =====================================================================

-- 1. APLICACIONES
INSERT INTO public.aplicacion VALUES (1, 'Gestion de Usuarios', 'Módulo de administración de roles y credenciales', true);
INSERT INTO public.aplicacion VALUES (2, 'Recursos Humanos', 'Gestión de personal, puestos y estructura organizacional', true);
INSERT INTO public.aplicacion VALUES (3, 'Gestor Documental', 'Archivos, carpetas y flujos documentales', true);
INSERT INTO public.aplicacion VALUES (4, 'Laboratorios', 'Gestión de laboratorios, equipos y servicios', true);
INSERT INTO public.aplicacion VALUES (5, 'Auditoria Global', 'Registro de actividades del sistema', true);
INSERT INTO public.aplicacion VALUES (6, 'Recepcion Equipos', 'Módulo de recepción y seguimiento de equipos', true);
INSERT INTO public.aplicacion VALUES (7, 'Gestion de Calidad', 'Auditorías internas, no conformidades y acciones correctivas', true);

-- 2. PERSONAS
INSERT INTO public.persona VALUES (1, 'Christian Estiven', 'Donoso Cevallos', '1751199041', '2003-02-23', 'M', 'El Pedestal', 'Sangolquí', 'Pichincha', 'cedonoso@espe.edu.ec', '', NULL, NULL, 'Usuario externo', '2026-07-08', 'Idioma por defecto del centro', '2026-07-08 10:40:22.35-05', '2026-07-08 10:40:22.35-05', '098-463-7269', '', 'ACTIVO', 'Sr.');
INSERT INTO public.persona VALUES (3, 'Pamela Jesabel', 'Carriel Mier', '1713660643', '2003-02-23', 'F', ' San Fernando', 'Quito', 'Pichincha', 'pjcarriel@espe.edu.ec', '', NULL, NULL, 'Usuario externo', '2026-07-09', 'Idioma por defecto del centro', '2026-07-09 08:44:56.24-05', '2026-07-09 08:44:56.24-05', '098-463-7265', '', 'ACTIVO', 'Srta.');
INSERT INTO public.persona VALUES (2, 'Stalin Fabian', 'Roche Cordova', '1751199040', '2003-02-23', 'M', 'Hospital del Sur', 'Quito', 'Pichincha', 'sfroche@espe.edu.ec', '', NULL, NULL, 'Usuario externo', '2026-07-08', 'Idioma por defecto del centro', '2026-07-08 10:41:46.732-05', '2026-07-09 08:45:13.699921-05', '098-463-7269', '', 'ACTIVO', 'Sr.');
INSERT INTO public.persona VALUES (5, 'Marco', 'Vinueza Cahuasquí', '1715953821', '2003-02-23', 'M', 'Forestal', 'Quito', 'Santa Elena', 'mavinueza@espe.edu.ec', '', NULL, NULL, 'Usuario externo', '2026-07-09', 'Idioma por defecto del centro', '2026-07-09 10:18:49.309-05', '2026-07-09 10:18:49.309-05', '098-463-1269', '', 'ACTIVO', 'Tnte.');
INSERT INTO public.persona VALUES (4, 'Miguel Angel', 'Sangucho', '1713660642', '2003-02-23', 'M', 'Forestal', 'Quito', 'Santa Elena', 'msanguncho@espe.edu.ec', '', NULL, NULL, 'Usuario externo', '2026-07-09', 'Idioma por defecto del centro', '2026-07-09 10:09:11.711-05', '2026-07-15 08:13:23.392244-05', '098-463-1269', '', 'ACTIVO', 'Sr.');
INSERT INTO public.persona VALUES (9, 'Katerin', 'Heredia', '1715953822', '2003-01-01', 'F', NULL, 'Quito', 'Pichincha', 'ktheredia@gmail.com', NULL, NULL, NULL, 'Usuario externo', '2026-08-11', 'Idioma por defecto del centro', '2026-08-11 11:28:28.713-05', '2026-08-11 11:28:28.713-05', '098-463-1268', NULL, 'ACTIVO', 'Sra.');

-- 3. USUARIOS Y GRUPOS
INSERT INTO public.grupo VALUES (1, 'Administrador', '', true, '2026-07-08 10:42:17.947-05', '2026-08-06 11:15:57.077-05');

INSERT INTO public.usuario VALUES (1, 1, 'ced', '$2b$10$KmlablXUqDHAQ0nFSrp9IOabxwATr6YE1VnP1HoqLLs9PBE4HoczK', true, '2026-07-08 10:42:34.401-05', '2026-07-08 10:42:34.401-05', false, false, false, false, NULL, 'Español (Ecuador)');
INSERT INTO public.usuario VALUES (2, 2, 'sfr', '$2b$10$XZDexmrvAMn3ty6.3Ifxe.jqgnH4NHq0BGLrFImFa6YiOQ7eEQ6La', true, '2026-07-08 10:42:56.322-05', '2026-07-08 10:42:56.322-05', false, false, false, false, NULL, 'Español (Ecuador)');
INSERT INTO public.usuario VALUES (3, 3, 'pjc', '$2b$10$Lge5BIkqOPJoT3N59KZPSeaAZIEk.Ss6iW1I6UCG8elbRb.TfBrJK', true, '2026-07-09 09:01:21.316-05', '2026-07-09 09:01:21.316-05', false, false, false, false, NULL, 'Español (Ecuador)');
INSERT INTO public.usuario VALUES (4, 4, 'mas', '$2b$10$/Nr46UKEstrXyHxFLfedkOdqf.5L2YB3ujj6Gkc5TVav0Nlw6PRsO', true, '2026-07-09 10:10:15.75-05', '2026-07-09 10:10:15.75-05', false, false, false, false, NULL, 'Español (Ecuador)');
INSERT INTO public.usuario VALUES (5, 5, 'dcm', '$2b$10$Kb9TdUx.12pQSJyBzGdbG.4XmQTMZ5Q64EEXGi.RSXGisz3DJDjbq', true, '2026-07-09 10:19:11.389-05', '2026-07-09 10:19:11.389-05', false, false, false, false, NULL, 'Español (Ecuador)');
INSERT INTO public.usuario VALUES (7, 9, 'kth', '$2b$10$GJCbJc1TUV/uhbP7fKF9.OAoAn3755ywKKfrVBF.zowmTk5b4CpfS', true, '2026-08-11 11:29:16.676-05', '2026-08-11 11:29:16.676-05', false, false, false, false, NULL, 'Español (Ecuador)');

INSERT INTO public."_UsuarioGrupos" VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 7);

INSERT INTO public.grupo_aplicacion VALUES (14, 1, 5, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (15, 1, 1, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (16, 1, 3, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (17, 1, 4, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (18, 1, 6, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (19, 1, 2, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');
INSERT INTO public.grupo_aplicacion VALUES (20, 1, 7, 5, 0, '2026-08-06 11:15:57.081-05', '2026-08-06 11:15:57.081-05');

-- 4. PUESTOS Y ASIGNACIONES
INSERT INTO public.puesto VALUES (1, 'DCM', 'Director del CMEE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:34:36.192-05', '2026-07-08 10:34:36.192-05');
INSERT INTO public.puesto VALUES (2, 'JDC', 'Jefe Departamento Gestión de la Calidad', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:34:48.052-05', '2026-07-08 10:34:48.052-05');
INSERT INTO public.puesto VALUES (3, 'RSEC', 'Responsable servicio al Cliente', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:34:59.404-05', '2026-07-08 10:34:59.404-05');
INSERT INTO public.puesto VALUES (4, 'JDT', 'Jefe de Departamento Técnico', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:35:15.776-05', '2026-07-08 10:35:15.776-05');
INSERT INTO public.puesto VALUES (5, 'OBT', 'Observador Técnico', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:35:52.049-05', '2026-07-08 10:35:52.049-05');
INSERT INTO public.puesto VALUES (6, 'RET', 'Responsable Técnico', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-08', '2026-07-08 10:36:06.063-05', '2026-07-08 10:36:06.063-05');

-- 5. LABORATORIOS Y DEPARTAMENTOS
INSERT INTO public.laboratorio VALUES (1, 'LPR', 'Laboratorio de Presión', '', true, NULL, '2026-07-08 10:48:42.129-05', '2026-07-08 10:48:42.129-05');
INSERT INTO public.laboratorio VALUES (3, 'LTE', 'Laboratorio de Termometría', '', true, 9, '2026-07-14 11:17:02.994-05', '2026-08-11 11:36:19.152-05');
INSERT INTO public.laboratorio VALUES (2, 'LNTYF', 'Laboratorio Nacional Designado de Tiempo y Frecuencia', '', true, 3, '2026-07-09 08:43:17.538-05', '2026-08-19 08:51:13.233-05');

INSERT INTO public.departamento VALUES (1, 'DCM', 'Dirección del Centro de Metrología', 'Departamento', '', NULL, NULL, 0, true, '2026-07-08 10:36:58.538-05', '2026-07-08 10:36:58.538-05', NULL);
INSERT INTO public.departamento VALUES (2, 'DPC', 'Departamento de Calidad', 'Departamento', '', 1, NULL, 0, true, '2026-07-08 10:37:14.408-05', '2026-07-08 10:37:14.408-05', NULL);
INSERT INTO public.departamento VALUES (3, 'DPT', 'Departamento Técnico', 'Departamento', '', 1, NULL, 0, true, '2026-07-08 10:37:27.964-05', '2026-07-08 10:37:27.964-05', NULL);
INSERT INTO public.departamento VALUES (4, 'DPA', 'Departamento Administrativo', 'Departamento', '', 1, NULL, 0, true, '2026-07-08 10:38:03.02-05', '2026-07-08 10:38:08.879019-05', NULL);
INSERT INTO public.departamento VALUES (5, 'LME', 'Laboratorio de Magnitudes Eléctricas', 'Departamento', '', 3, NULL, 0, true, '2026-07-08 10:38:27.534-05', '2026-07-08 10:38:27.534-05', NULL);
INSERT INTO public.departamento VALUES (9, 'SRC', 'Servicio al Cliente / Marketing', 'Departamento', '', 1, NULL, 0, true, '2026-07-08 10:39:44.868-05', '2026-07-08 10:39:44.868-05', NULL);
INSERT INTO public.departamento VALUES (6, 'LPR', 'Laboratorio de Presión', 'Departamento', '', 3, NULL, 0, true, '2026-07-08 10:38:58.073-05', '2026-07-08 11:06:17.196013-05', 1);
INSERT INTO public.departamento VALUES (8, 'LNDTF', 'Laboratorio Nacional Designado de Tiempo y Frecuencia', 'Departamento', '', 3, NULL, 0, true, '2026-07-08 10:39:31.032-05', '2026-07-09 08:45:23.679266-05', 2);
INSERT INTO public.departamento VALUES (7, 'LTE', 'Laboratorio de Termometría', 'Departamento', '', 3, 9, 0, true, '2026-07-08 10:39:12.745-05', '2026-08-11 11:36:12.499678-05', 3);

INSERT INTO public.persona_puesto VALUES (1, 1, 3, 9, 1, '2026-07-08', true, '2026-07-08 10:40:22.35-05');
INSERT INTO public.persona_puesto VALUES (7, 3, 5, 8, 1, '2026-07-09', true, '2026-07-09 08:44:56.24-05');
INSERT INTO public.persona_puesto VALUES (8, 2, 6, 8, 1, '2026-07-09', true, '2026-07-09 08:45:13.708-05');
INSERT INTO public.persona_puesto VALUES (11, 5, 1, 1, 1, '2026-07-09', true, '2026-07-09 10:18:49.309-05');
INSERT INTO public.persona_puesto VALUES (12, 4, 4, 8, 1, '2026-07-15', true, '2026-07-15 08:13:23.395-05');
INSERT INTO public.persona_puesto VALUES (13, 9, 5, 7, 1, '2026-08-11', true, '2026-08-11 11:28:28.713-05');

-- 6. RECEPCIÓN DE EQUIPOS Y CLIENTES
INSERT INTO public.clientes_institucionales VALUES (1, 'ANDES PETROLEUM ECUADOR LTD', 'CIVIL', true, 'Av. Naciones Unidas E10-44 y Republica del Salvador', NULL, 'Franklin Casa', NULL, '0983392609');

INSERT INTO public.ordenes_trabajo VALUES (1, '0013679', '2026-07-09', 1, '2026-07-09 08:58:08.182-05', '2026-07-09 08:58:08.182-05', NULL, 1);
INSERT INTO public.ordenes_trabajo VALUES (2, '000002', '2026-07-21', 1, '2026-07-21 10:09:21.416-05', '2026-07-21 10:09:21.416-05', 'SAC-007', 1);
INSERT INTO public.ordenes_trabajo VALUES (3, '87659', '2026-08-06', 1, '2026-08-06 09:03:32.078-05', '2026-08-06 09:03:32.078-05', 'jhg8', 1);
INSERT INTO public.ordenes_trabajo VALUES (4, '098877', '2026-08-06', 1, '2026-08-06 09:06:30.307-05', '2026-08-06 09:06:30.307-05', 'qwe234', 1);
INSERT INTO public.ordenes_trabajo VALUES (5, '000005', '2026-08-06', 1, '2026-08-06 09:22:14.097-05', '2026-08-06 09:22:14.097-05', NULL, 1);
INSERT INTO public.ordenes_trabajo VALUES (6, '000009', '2026-08-11', 1, '2026-08-11 11:26:10.071-05', '2026-08-11 11:26:10.071-05', 'SAC-009', 1);
INSERT INTO public.ordenes_trabajo VALUES (7, '000010', '2026-08-13', 1, '2026-08-13 09:03:49.735-05', '2026-08-13 09:03:49.735-05', NULL, 1);

INSERT INTO public.equipos_recepcion VALUES (1, 1, 'Cronómetro', 'EQ-DY-125', 2, 'FINALIZADO', 2, '2026-07-09 08:58:08.182-05', '2026-07-09 10:21:46.37-05', 'Con caja y cordón', 'CMEE26.002-2', '2026-07-10', 'PURSUM', 'PS-1006', '200seg, 600seg, 1680seg');
INSERT INTO public.equipos_recepcion VALUES (3, 3, 'mijh', '12345', 3, 'EN_ESPERA', NULL, '2026-08-06 09:03:32.078-05', '2026-08-06 09:03:32.078-05', 'mic', '766', '2026-08-18', 'hhj', '768', '465seg');
INSERT INTO public.equipos_recepcion VALUES (4, 4, 'laptop', 'des432', 2, 'PENDIENTE_FIRMA_TECNICO', 2, '2026-08-06 09:06:30.307-05', '2026-08-06 09:08:19.742-05', 'mic', '887', '2026-08-10', 'hp', '213', '677ges');
INSERT INTO public.equipos_recepcion VALUES (5, 5, 'Termometro', '123456789', 2, 'PENDIENTE_FIRMA_TECNICO', 2, '2026-08-06 09:22:14.097-05', '2026-08-06 09:25:43.736-05', 'con cuerda', 'CMEE2202', '2026-08-07', 'Taylo', '1234', '200seg');
INSERT INTO public.equipos_recepcion VALUES (6, 6, 'Termometo', '123456', 3, 'EN_CALIBRACION', 9, '2026-08-11 11:26:10.071-05', '2026-08-11 12:20:10.751-05', 'CON CAJA', 'CMEE26-2001', '2026-08-12', 'TAYLOR', '9841', '200');
INSERT INTO public.equipos_recepcion VALUES (2, 2, 'Cronometro', '123456', 2, 'PENDIENTE_FIRMA_TECNICO', 2, '2026-07-21 10:09:21.416-05', '2026-08-11 12:21:33.173-05', 'Con cuerda', 'CMEE-123', '2026-07-21', 'Taylor', '3920', '200 seg');
INSERT INTO public.equipos_recepcion VALUES (7, 7, 'Cronometro', '12345678', 2, 'FINALIZADO', 2, '2026-08-13 09:03:49.735-05', '2026-08-13 09:40:04.318-05', 'Con caja', 'CMEE2026-001', '2026-08-13', 'Taylor', '9810', '200seg');

-- 7. GESTOR DOCUMENTAL (Carpetas, Permisos y Documentos)
INSERT INTO public.circuitos VALUES (1, 'CALIDAD', true);
INSERT INTO public.fases VALUES (1, 1, 'ELABORACION', 10, '', '', false, true, false, true, false, false);
INSERT INTO public.fases VALUES (2, 1, 'APROBACION', 10, '', '', false, true, false, true, false, false);
INSERT INTO public.fases_participantes VALUES (1, 1, 1), (2, 2, 3);

INSERT INTO public.carpetas VALUES (1, 'Prueba', 'LIBRERIA', 10, true, '2026-07-17 15:56:35.335', '2026-07-17 15:56:35.335', NULL, '', '', NULL, '1');
INSERT INTO public.carpetas VALUES (2, 'Prueba 1', 'AREA', 10, true, '2026-07-17 15:56:48.597', '2026-07-17 15:56:48.597', 1, '', '', NULL, '1');
INSERT INTO public.carpetas VALUES (3, 'Prueba 1.1', 'SUBCARPETA', 10, true, '2026-07-17 15:57:02.442', '2026-07-17 15:57:02.442', 2, '', '', NULL, '1');
INSERT INTO public.carpetas VALUES (4, 'Documentos', 'LIBRERIA', 10, true, '2026-08-05 16:03:58.312', '2026-08-05 16:03:58.312', NULL, '', '', NULL, '1');

INSERT INTO public.carpetas_permisos VALUES (1, 1, NULL, 5, true, true, true, 5), (2, 1, NULL, 5, true, true, true, 1), (3, 1, NULL, 5, true, true, true, 3), (4, 1, NULL, 5, true, true, true, 2), (5, 1, NULL, 5, true, true, true, 4), (6, 2, NULL, 5, true, true, true, 5), (7, 2, NULL, 5, true, true, true, 1), (8, 2, NULL, 5, true, true, true, 3), (9, 2, NULL, 5, true, true, true, 2), (10, 2, NULL, 5, true, true, true, 4), (11, 3, NULL, 5, true, true, true, 5), (12, 3, NULL, 5, true, true, true, 1), (13, 3, NULL, 5, true, true, true, 3), (14, 3, NULL, 5, true, true, true, 2), (15, 3, NULL, 5, true, true, true, 4), (16, 4, NULL, 5, true, true, true, 5), (17, 4, NULL, 5, true, true, true, 1), (18, 4, NULL, 5, true, true, true, 3), (19, 4, NULL, 5, true, true, true, 2), (20, 4, NULL, 5, true, true, true, 4);

INSERT INTO public.documentos VALUES (14, NULL, 'Doc1', 'uploads/Gestor_Documental/Prueba/Prueba 1/Prueba 1.1/firma_21_documento_firmado.pdf', '1', 0, true, '2026-08-06 18:24:31.41', '2026-08-06 18:26:13.201', 3, 'Centro de Metrología del Ejército Ecuatoriano', '2026-08-06', 'Christian Estiven Donoso Cevallos', 1);
INSERT INTO public.documentos_versiones VALUES (12, 14, '1', 'uploads/Gestor_Documental/Prueba/Prueba 1/Prueba 1.1/Doc1.pdf', 'Christian Estiven Donoso Cevallos', NULL, '2026-08-06 18:24:31.413');
INSERT INTO public.documentos_workflow VALUES (11, 14, 1, 'EN_CURSO', '2026-08-06 18:24:31.417', '2026-08-06 18:24:31.417');
INSERT INTO public.documentos_workflow_fases VALUES (21, 11, 1, 'COMPLETADO', 'uploads/Gestor_Documental/Prueba/Prueba 1/Prueba 1.1/firma_21_documento_firmado.pdf', 'KATERIN TATIANA HEREDIA TAPIA', NULL, '2026-08-06 18:24:31.417', '2026-08-06 18:26:13.195');
INSERT INTO public.documentos_workflow_fases VALUES (22, 11, 2, 'EN_CURSO', NULL, NULL, NULL, '2026-08-06 18:24:31.417', '2026-08-06 18:26:13.203');
INSERT INTO public.firma_documento_fase VALUES (5, 21, 1, 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', 'b1146af3f0566829cfb598c4f4ad1ca0c6e479ac8f01622cc2dc0eaa9984b0f4', '2026-08-06 18:26:13.198', '2026-08-06 13:26:13.198-05');

-- 8. CERTIFICADOS
INSERT INTO public.certificado VALUES (1, 'C:\Users\suco2\Documents\CMEE_SGD\backend\uploads\certificados\1783609626167_plan_trabajo_pasantes_Software.pdf', 'plan_trabajo_pasantes_Software.pdf', '2026-07-09 10:07:06.185-05', 2, '2026-07-09 10:07:06.185-05', '2026-07-09 10:07:06.185-05', 1, 'a9a057d2-7d1f-4810-8248-a6e5cc745c68', 1);
INSERT INTO public.certificado VALUES (2, 'C:\Users\suco2\Documents\CMEE_SGD\backend\uploads\certificados\1786025281823_Informe_Mensual_Mes2_CMEE_Donoso_Christian.pdf', 'Informe_Mensual_Mes2_CMEE_Donoso Christian.pdf', '2026-08-06 09:08:01.969-05', 2, '2026-08-06 09:08:01.969-05', '2026-08-06 09:08:01.969-05', 4, 'd7bbfe2f-9d31-4055-bdfe-66b009647a22', 2);
INSERT INTO public.certificado VALUES (3, 'C:\Users\suco2\Documents\CMEE_SGD\backend\uploads\certificados\1786026325739_Doc1.pdf', 'Doc1.pdf', '2026-08-06 09:25:25.751-05', 2, '2026-08-06 09:25:25.751-05', '2026-08-06 09:25:25.751-05', 5, 'a26620e0-e0cb-4633-a4bf-167ec948488a', 3);
INSERT INTO public.certificado VALUES (4, 'C:\Users\suco2\Documents\CMEE_SGD\backend\uploads\certificados\1786468867340_document.pdf', 'document.pdf', '2026-08-11 12:21:07.351-05', 2, '2026-08-11 12:21:07.351-05', '2026-08-11 12:21:07.351-05', 2, 'da47167f-2d5e-4408-b8ab-f601a2a04f62', 4);
INSERT INTO public.certificado VALUES (5, 'C:\Users\suco2\Documents\CMEE_SGD\backend\uploads\certificados\1786631980215_certificado_firmado.pdf', 'certificado_firmado.pdf', '2026-08-13 09:05:13.258-05', 2, '2026-08-13 09:05:13.258-05', '2026-08-13 09:39:40.233-05', 7, '0b9e423e-a313-4511-8d00-3e899e8c2c55', 5);

INSERT INTO public.firma_digital VALUES (1, 5, 2, 'TECNICO', 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', '9e1b1660cab7dcc73bd7daf03f131dcaeae79c82e84da94308eeec095847d7d9', '2026-08-13 14:21:14.504', '2026-08-13 09:21:14.504-05');
INSERT INTO public.firma_digital VALUES (2, 5, 4, 'JEFE', 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', '1cea4ada86135936b748cf8cfb462d89383326cf1a46cca617de684b8a837397', '2026-08-13 14:31:37.254', '2026-08-13 09:31:37.254-05');
INSERT INTO public.firma_digital VALUES (3, 5, 5, 'DIRECTOR', 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', '6f98c1be8155467d1e314d79d34b9968a5b143b19979d9e9667f200bc12f9f6b', '2026-08-13 14:39:40.236', '2026-08-13 09:39:40.236-05');

-- 9. GESTIÓN DE CALIDAD (NC, Riesgos, Quejas)
INSERT INTO public.configuracion_general VALUES (1, 'Centro de Metrología del Ejército Ecuatoriano', 5, '2026-07-17 09:16:01.523-05');

INSERT INTO public.queja VALUES (1, 'Q-0001', 'Empresa Acme S.A. ACTUALIZADA', '555-1234', 'test@test.com', 'Pedro Lopez', 'Descripcion actualizada', 'Juan Pérez García', '2026-08-12', 'TECNICA', true, NULL, 'IAC-2026-012', 'Se revisó el certificado #CAL-2026-045 y se confirmó desviación.', '2026-08-27', 'Se verifico la nueva calibracion y el equipo esta dentro de tolerancia.', '2026-08-12', 'Maria Gonzalez Lopez', 'EN_SEGUIMIENTO', NULL, true, '2026-08-12 20:22:49.193+00', '2026-08-17 15:59:46.087+00', NULL);
INSERT INTO public.queja VALUES (2, 'Q-0002', 'Empresa de Prueba S.A.', '099-123-4567', 'contacto@prueba.com', 'Juan Perez (Representante)', 'El servicio de calibracion no cumple con los tiempos acordados.', 'Ing. Maria Lopez - Recepcionista', '2026-08-17', 'GESTION_CALIDAD', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PROCEDENTE', NULL, true, '2026-08-17 19:14:02.408+00', '2026-08-17 19:15:36.833+00', NULL);

INSERT INTO public.riesgo_oportunidad VALUES (1, 'R-0001', 'RIESGO', 'JDC_IMPARCIALIDAD', 'Posible sesgo en la emisión de resultados por presión externa', 'Relación comercial con el cliente', 'Externa', 'Afecta la imparcialidad', 5, 7, 6, 210, 'ALTO', 'REDUCIR', 'Aplicar análisis de riesgos de imparcialidad semestral', NULL, 'EN_SEGUIMIENTO', 'Prueba E2E', false, '2026-08-12 17:19:41.139+00', '2026-08-12 17:20:06.151+00', NULL, NULL, NULL);
INSERT INTO public.riesgo_oportunidad VALUES (2, 'O-0001', 'OPORTUNIDAD', 'JDT_CALIBRACION', 'Demanda creciente de calibración de equipos de nueva tecnología', 'Nuevos sectores industriales', 'Externa', 'Ampliar la cartera de servicios', 6, 5, 3, 90, 'MODERADO', 'ASUMIR', 'Evaluar viabilidad técnica y capacitar personal', NULL, 'EN_SEGUIMIENTO', NULL, false, '2026-08-12 17:19:50.623+00', '2026-08-12 17:20:06.239+00', NULL, NULL, NULL);
INSERT INTO public.riesgo_oportunidad VALUES (3, 'R-0002', 'RIESGO', 'DCM', 'Falla en el sistema informatico del CMEE que impide el procesamiento de resultados', 'Infraestructura tecnologica obsoleta', 'Interna', 'Retraso en la emision de informes', 6, 7, 4, 168, 'MODERADO', 'REDUCIR', 'Implementar sistema de respaldo automatico', '2026-09-15', 'IDENTIFICADO', 'Prioridad alta', true, '2026-08-18 01:53:03.633+00', '2026-08-18 01:53:03.633+00', NULL, NULL, NULL);

INSERT INTO public.riesgo_responsable VALUES (1, 3, 'IDENTIFICACION', 'Jose Cusin', 'Jefe Dpto. Calidad', '2026-08-17', '2026-08-18 01:53:03.633+00');
INSERT INTO public.riesgo_responsable VALUES (2, 3, 'IDENTIFICACION', 'Noe Tapia', 'Jefe Dpto. Tecnico', '2026-08-17', '2026-08-18 01:53:03.633+00');

INSERT INTO public.no_conformidad VALUES (3, '2', 1, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-08-04 17:00:52.127+00', '2026-08-04 17:17:41.809+00', false, 'Falta de registros de calificación', 'El laboratorio no conserva todos los registros', false, 'NTE INEN ISO/IEC 17025 2018, requisito 7.7.1', 'NC', '{"obCausa": "", "causaRaiz": "<p>Falta de control adecuado.</p>", "obExtension": "", "correcciones": [], "analisisCausa": "<p>No trazabilidad.</p>", "analisisExtension": "<p>Seguimiento al personal.</p>", "accionesCorrectivas": []}', NULL, NULL);
INSERT INTO public.no_conformidad VALUES (1, '1', 1, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-07-28 16:44:04.647+00', '2026-07-28 17:22:27.962+00', false, 'Criterio de aceptación o rechazo...', 'Técnicas estadísticas inadecuadas...', false, 'NC 01 NTE INEN ISO/IEC 17025 2018, requisito 5.5 b', 'NC', NULL, NULL, NULL);
INSERT INTO public.no_conformidad VALUES (23, '1', 2, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-08-04 18:16:44.232+00', '2026-08-04 18:57:46.968+00', false, 'El laboratorio dispone el formato...', 'No se asegura de NC similares...', false, 'NC 01 NTE INEN ISO/IEC 17025 2018, requisito 5.5 b', 'NC', '{"archivo": "/uploads/calidad/Matriz.docx"}', '/uploads/calidad/noconformidades/2026/agosto/NC-3-04082026.pdf', NULL);
INSERT INTO public.no_conformidad VALUES (28, '1', 5, NULL, NULL, 'MENOR', NULL, NULL, 'CERRADA', NULL, '2026-08-06', true, '2026-08-06 16:42:57.864+00', '2026-08-06 21:16:46.589+00', true, 'Revisión del archivo de calidad...', 'La evidencia de la verificación...', false, 'ISO/IEC 17025:2017, sección 8.6.2', 'NC', '{}', NULL, '{"fecha": "2026-09-01", "resultado": "EFICAZ"}');

INSERT INTO public.no_conformidad_historial VALUES (5, 28, 'EN_CURSO', 'VERIFICADA', 'ESTADO', 'Se verificó la actualización del procedimiento y la firma del formato. Acciones eficaces, se cierra la NC.', 1, '2026-08-06 21:16:22.595+00');
INSERT INTO public.no_conformidad_historial VALUES (6, 28, 'VERIFICADA', 'EN_CURSO', 'ESTADO', 'Reapertura de la no conformidad', 1, '2026-08-06 21:16:36.507+00');
INSERT INTO public.no_conformidad_historial VALUES (7, 28, 'EN_CURSO', 'CERRADA', 'ESTADO', 'Cierre formal de la no conformidad', 1, '2026-08-06 21:16:46.595+00');

-- 10. REAJUSTE DE SECUENCIAS
SELECT pg_catalog.setval('public.aplicacion_id_seq', 7, true);
SELECT pg_catalog.setval('public.carpetas_id_seq', 4, true);
SELECT pg_catalog.setval('public.certificado_id_seq', 5, true);
SELECT pg_catalog.setval('public.documentos_id_seq', 14, true);
SELECT pg_catalog.setval('public.equipos_recepcion_id_seq', 7, true);
SELECT pg_catalog.setval('public.persona_id_seq', 13, true);
SELECT pg_catalog.setval('public.usuario_id_seq', 7, true);
SELECT pg_catalog.setval('public.auditoria_id_seq', 1000, true);
SELECT pg_catalog.setval('public.auditoria_interna_id_seq', 11, true);