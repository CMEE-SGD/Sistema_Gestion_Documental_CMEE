--
-- PostgreSQL database dump
--

\restrict 2cXlMdV2WJsFyBoFxNI43mtwaOfumNRiaV8AuFdUDQSpoNxspYKmPfWNQZXwynQ

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.persona VALUES (2, 'Luis Fernando', 'Torres Andrade', '17501674842', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'luis.fernando.torres@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.286+00', '2026-08-06 16:19:46.286+00', '0930992464', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (3, 'María Elena', 'Cedeño Villafuerte', '17296517564', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'maria.elena.cedeno@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.327+00', '2026-08-06 16:19:46.327+00', '0923476825', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (4, 'Carlos Andrés', 'Mena Zambrano', '17782843933', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'carlos.andres.mena@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.345+00', '2026-08-06 16:19:46.345+00', '0953261913', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (5, 'Patricia Alexandra', 'Salazar Cobo', '17430588894', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'patricia.alexandra.salazar@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.36+00', '2026-08-06 16:19:46.36+00', '0994077217', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (6, 'Verónica Estefanía', 'Naranjo Palacios', '17551223745', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'veronica.estefania.naranjo@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.382+00', '2026-08-06 16:19:46.382+00', '0918740916', NULL, 'ACTIVO', 'Sra.');
INSERT INTO public.persona VALUES (7, 'Jorge Iván', 'Delgado Ortiz', '17839035519', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'jorge.ivan.delgado@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.402+00', '2026-08-06 16:19:46.402+00', '0955468058', NULL, 'ACTIVO', 'Sr.');
INSERT INTO public.persona VALUES (8, 'Diego Armando', 'Paredes Núñez', '17335798258', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'diego.armando.paredes@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.424+00', '2026-08-06 16:19:46.424+00', '0947058093', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (9, 'Katherine Lisbeth', 'Ramos Vera', '17607554165', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'katherine.lisbeth.ramos@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.441+00', '2026-08-06 16:19:46.441+00', '0965513254', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (10, 'Bryan Santiago', 'Quintero León', '17660806936', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'bryan.santiago.quintero@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.453+00', '2026-08-06 16:19:46.453+00', '0944660098', NULL, 'ACTIVO', 'Tng.');
INSERT INTO public.persona VALUES (11, 'Daniela Cristina', 'Hurtado Vega', '17572284373', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'daniela.cristina.hurtado@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.465+00', '2026-08-06 16:19:46.465+00', '0996191112', NULL, 'ACTIVO', 'Tng.');
INSERT INTO public.persona VALUES (12, 'Andrea Carolina', 'Vásquez Molina', '17763319055', NULL, 'F', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'andrea.carolina.vasquez@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.475+00', '2026-08-06 16:19:46.475+00', '0915031505', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (13, 'Ricardo Javier', 'Bravo Cifuentes', '17193074764', NULL, 'M', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Pichincha', 'ricardo.javier.bravo@cmee.gob.ec', NULL, NULL, NULL, 'Usuario del sistema', '2026-08-06', 'Idioma por defecto del centro', '2026-08-06 16:19:46.483+00', '2026-08-06 16:19:46.483+00', '0919757276', NULL, 'ACTIVO', 'Ing.');
INSERT INTO public.persona VALUES (1, 'Miguel', 'Sangucho', '1755922877', NULL, ' ', '', '', '', '', '', NULL, NULL, 'Usuario externo', '2026-07-27', 'Idioma por defecto del centro', '2026-07-27 15:03:45.045+00', '2026-08-06 17:04:20.503202+00', '', '', 'ACTIVO', 'Sr.');


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: _PersonaRoles; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: grupo; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.grupo VALUES (1, 'Administrador', '', true, '2026-07-27 15:04:34.066+00', '2026-07-27 15:06:37.567+00');


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.usuario VALUES (1, 1, 'ms', '$2b$10$04W9GjT1cXaP.Q8psaLYiu60RJ5TLdIiz9LgmWbpFkqleddOE0Laa', true, '2026-07-27 15:04:55.982+00', '2026-07-27 15:04:55.982+00', false, false, false, false, NULL, 'Español (Ecuador)');


--
-- Data for Name: _UsuarioGrupos; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public."_UsuarioGrupos" VALUES (1, 1);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public._prisma_migrations VALUES ('9d11905d-b11e-4891-b570-d8e1c65bd3d2', '9333c1fda636fa0a67456e2b525c3c4f11524a837bd49c895f5ba20320107ac3', '2026-07-27 14:35:05.298875+00', '20260708152041_refactor_ordenes_equipos', NULL, NULL, '2026-07-27 14:35:05.284857+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9b2c7356-bb5d-4736-afb6-2f6a1740fb90', '7dc740e2d45a025f21430e223f4bd2d6015a78855fdacb1e3267d8b7a1f00da3', '2026-07-27 14:35:04.718294+00', '20260521130438_init_hr_schema', NULL, NULL, '2026-07-27 14:35:04.672712+00', 1);
INSERT INTO public._prisma_migrations VALUES ('8dba4975-6719-49b8-8472-a6109a7e6a74', 'e11b9708d44696d9a03d45e58579ef97d7c00acfcb7115374681a0fde2d416cd', '2026-07-27 14:35:05.14979+00', '20260623133403_refactor_campos_persona', NULL, NULL, '2026-07-27 14:35:05.139658+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5ae4bc42-677f-44bd-b9fa-e12e715efd70', '9868ee8e17e86e9decbea78f8039827d1f0c7f3ad81dd51a099fedca7f57e561', '2026-07-27 14:35:04.729744+00', '20260521142810_init_hr_schema', NULL, NULL, '2026-07-27 14:35:04.720326+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5705d72e-21af-42f9-8b3c-e1d4a6513661', '75f5057534a3207ad368aaf7524f55885574b5605b5e02604eecaef8cd39d7fa', '2026-07-27 14:35:04.74441+00', '20260521161857_modulo_usuarios', NULL, NULL, '2026-07-27 14:35:04.731354+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3b646940-cc27-4000-b648-3849431f3e1e', '1bbed245c4e76f689eabb2b5c220ef707ec833493c8fa00194911936896db980', '2026-07-27 14:35:05.242099+00', '20260629172021_add_laboratorio_to_departamento', NULL, NULL, '2026-07-27 14:35:05.235976+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4933dbca-4fa3-4418-a52b-e31998ca19f2', '8433236f4b57988d76e2130dec2a269dd1ff970fc937cfb227345a747c018b51', '2026-07-27 14:35:04.765681+00', '20260526154911_modulo_grupos_aplicaciones', NULL, NULL, '2026-07-27 14:35:04.750375+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5d932629-2560-4556-9bff-e870d50547d7', 'f5db564fa735f9b8fb8867aba0f87f9ef12d81d35bb47e651c4169b47e6be192', '2026-07-27 14:35:05.163082+00', '20260623144210_cambio_circuito_a_relacion', NULL, NULL, '2026-07-27 14:35:05.152269+00', 1);
INSERT INTO public._prisma_migrations VALUES ('0ad749b2-0abd-419f-a568-979ddd235810', '665085c19a2d6e88650965745b2ea9e0ee44e7c7c8d48fdc608aac1dfc83f6e9', '2026-07-27 14:35:04.81723+00', '20260526172305_init_gestion_documental', NULL, NULL, '2026-07-27 14:35:04.770401+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b1e958ce-6be6-459d-9cef-23e4cc9f9cd3', '3d420abba30c4f7dcbad8e9160e32c7fcdf4500ec650e62f1d10fe23bce14124', '2026-07-27 14:35:04.841597+00', '20260527172400_v3_permisos_carpetas', NULL, NULL, '2026-07-27 14:35:04.821888+00', 1);
INSERT INTO public._prisma_migrations VALUES ('d03624fc-2402-4cd5-a873-926241d96d21', '93bab44b77555aac9658885177624238e3b870275cb62502074e3100945fa598', '2026-07-27 14:35:04.890431+00', '20260601140824_agregada_tabla_auditoria_logs', NULL, NULL, '2026-07-27 14:35:04.848291+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b7439319-59aa-4efa-81d9-fa396c4081b0', '7d55fc37f10726170e625bdf01dc5b20fd0dfdb909be5fc0b59059c34d8d67c2', '2026-07-27 14:35:05.175625+00', '20260623152330_versiones_documentos', NULL, NULL, '2026-07-27 14:35:05.165439+00', 1);
INSERT INTO public._prisma_migrations VALUES ('59077583-5e24-47f9-bca9-a8953c3af100', '56df07ff9db22a2ba92dec0df088b769df3dda650737b2e185275f7ef66935d4', '2026-07-27 14:35:04.91981+00', '20260601152235_agregados_logs_roles_puestos', NULL, NULL, '2026-07-27 14:35:04.898731+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3e6ccf79-887c-4e4a-bc53-43b7b5022967', '1bf2518337df683825b6254375da01be76a804470f226126ee89d39a1fde44ac', '2026-07-27 14:35:04.964944+00', '20260602140651_audith', NULL, NULL, '2026-07-27 14:35:04.928465+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5ffb99ef-0597-4f9f-bd6c-04b63f4b2051', '666a818078f5544f3729940406b0c56897b4213dd6ade1b074e28efdfd56c241', '2026-07-27 14:35:05.044306+00', '20260602144742_doc', NULL, NULL, '2026-07-27 14:35:04.990929+00', 1);
INSERT INTO public._prisma_migrations VALUES ('a70928ad-6ec3-44d0-83bc-c89f298f28d8', '146a8f6e6753bebaa5f5435be30f23698c22eebe9233c3fc7aff6b6616bfb5eb', '2026-07-27 14:35:05.188159+00', '20260623153459_workflow_documentos', NULL, NULL, '2026-07-27 14:35:05.17755+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2e176c4e-bbeb-4eeb-8dfb-fb71a8705b30', '804f0e0bf0798d5471d462b4fe5d66c82999e9ef6a47b6d54f60e7e1e8caee90', '2026-07-27 14:35:05.076156+00', '20260603171939_documento_persona', NULL, NULL, '2026-07-27 14:35:05.056312+00', 1);
INSERT INTO public._prisma_migrations VALUES ('a1fb875e-4e96-4c94-8596-6c128e684238', '2492bf2b08e3bdd486dc4be83eefc5fc2bef6e35727d279d2a0029f8324b94e8', '2026-07-27 14:35:05.110064+00', '20260605135232_agregar_modulo_laboratorios', NULL, NULL, '2026-07-27 14:35:05.082024+00', 1);
INSERT INTO public._prisma_migrations VALUES ('62247539-1a3f-4830-bc87-e1937eff505d', 'f58c9cde8d2a9da7af084130aefd9917fcf2aa076cbe3d4d3ee7c5076d684525', '2026-07-27 14:35:05.253298+00', '20260701160742_add_notificaciones', NULL, NULL, '2026-07-27 14:35:05.24372+00', 1);
INSERT INTO public._prisma_migrations VALUES ('d12fcfc9-01cd-49fd-a040-607033aee015', '6740db17cddee1856873ab1aa821ee3ee11ff40f802fa65211896aed71f92e89', '2026-07-27 14:35:05.135715+00', '20260605155527_circuitos', NULL, NULL, '2026-07-27 14:35:05.11309+00', 1);
INSERT INTO public._prisma_migrations VALUES ('a865f3d7-36fd-4c98-8a16-3ee0e3c495e0', '4a2dacf4993b88e918da25921f179cd4746f301d58dd099fe0b7fe64071e9b61', '2026-07-27 14:35:05.200636+00', '20260625150002_init_modulo_administrativo', NULL, NULL, '2026-07-27 14:35:05.190434+00', 1);
INSERT INTO public._prisma_migrations VALUES ('dca942e0-c5fb-45de-a6e0-b1e205d1b1e9', 'f0d8a9d10419201187de97a4fb6404720cfc4a1ddd574de27682cf1c80ca58b8', '2026-07-27 14:35:05.210887+00', '20260625153447_revertir_modulo_admin', NULL, NULL, '2026-07-27 14:35:05.202151+00', 1);
INSERT INTO public._prisma_migrations VALUES ('441048e2-27cf-4e05-b67c-7500f4b3fba4', '6d3a69e19be2a0e8d397578fd7c15942fefbd464239ed3fea7be44531ff21113', '2026-07-27 14:35:05.373657+00', '20260716155619_add_archivo_planificacion', NULL, NULL, '2026-07-27 14:35:05.368027+00', 1);
INSERT INTO public._prisma_migrations VALUES ('0c2e1739-addc-4106-9230-03d3df022442', 'bbca28e119f127fece4b463f9ca0cfd58ee12841421344830aecc9416c5f0e80', '2026-07-27 14:35:05.225491+00', '20260629144025_init_modulo_administrativo_ligero', NULL, NULL, '2026-07-27 14:35:05.213314+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1106a300-5d24-4708-a97c-e30ae3018470', '9c095405618c1cbaba8b5e548116d4b8a24a00b4398f43c5c90cc518ccb3079d', '2026-07-27 14:35:05.264155+00', '20260702133854_add_certificado_model', NULL, NULL, '2026-07-27 14:35:05.255604+00', 1);
INSERT INTO public._prisma_migrations VALUES ('87297dd4-2324-4424-a5f8-baa762ee4a68', '7f41ca968057af0406ac89fd5148b6d3c7e1b97df62203022ca7afbc3968fa3b', '2026-07-27 14:35:05.234153+00', '20260629161943_add_asignacion_tecnicos', NULL, NULL, '2026-07-27 14:35:05.22787+00', 1);
INSERT INTO public._prisma_migrations VALUES ('827eb790-67cf-4c69-9d6c-b709c872035e', '2f878f7b630c7166d4022ea43c0f9cf7a4e5935e687d86b92d876ed39ae0f387', '2026-07-27 14:35:05.310627+00', '20260708162653_add_campos_excel_legacy', NULL, NULL, '2026-07-27 14:35:05.300777+00', 1);
INSERT INTO public._prisma_migrations VALUES ('0ade0bd2-c866-43fa-b28c-aa2537c88b29', 'ff2634195de381b6bc8e66d8bbe3b912b20b44923cb2e331e61d10a4ffa28713', '2026-07-27 14:35:05.272261+00', '20260702135734_certificado_nombre_original_obligatorio', NULL, NULL, '2026-07-27 14:35:05.267279+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7b4839f1-a404-4251-b3d3-6e4eca5c3916', 'ff3415558b18e14520188217188f63ead8fdfdc4a1b896ce8f47224d852dbcf7', '2026-07-27 14:35:05.282904+00', '20260702152308_workflow_estados_recepcion', NULL, NULL, '2026-07-27 14:35:05.274237+00', 1);
INSERT INTO public._prisma_migrations VALUES ('cbcb44be-f6f3-4848-a8b2-8e6cbb0332e1', '768bb2b017428fce746855a90e7202a5be261751886f866d2629210b1ed51067', '2026-07-27 14:35:05.340527+00', '20260709132424_agregar_campos_cliente_fisico', NULL, NULL, '2026-07-27 14:35:05.333441+00', 1);
INSERT INTO public._prisma_migrations VALUES ('bf80e2d3-4a9b-43c4-a3f8-d968e1190181', '296f8fa21871ce162ea7d2a9d7a4e517b07a6d0f37130d8586fce0f02d03c55d', '2026-07-27 14:35:05.322559+00', '20260709111332_add_numero_codigo_certificado', NULL, NULL, '2026-07-27 14:35:05.312323+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7078173b-d442-441c-9311-3c61580d73f7', '34604e2e8ad85f43e0b876f8617844bafb942e66da18d56629985e45b4c01a73', '2026-07-27 14:35:05.365954+00', '20260716152529_add_calidad_module', NULL, NULL, '2026-07-27 14:35:05.351232+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c14c95fc-7c6a-452b-a3c5-3b8efdf8e80d', 'd0f5fae9f285d2b02323b249ff291585821b95c638172ddfe794fbc7daaddccf', '2026-07-27 14:35:05.331811+00', '20260709111446_codigo_verificacion_not_null', NULL, NULL, '2026-07-27 14:35:05.324787+00', 1);
INSERT INTO public._prisma_migrations VALUES ('91b1fd3a-c4b0-40f8-a06d-412bdd426a03', '8951d67734a94b5244352118f2a8c69595542fa1f61dc5da91fbb01118ef4de8', '2026-07-27 14:35:05.348447+00', '20260709163732_add_revision_calidad_estado', NULL, NULL, '2026-07-27 14:35:05.342368+00', 1);
INSERT INTO public._prisma_migrations VALUES ('be56b7d1-911e-4915-8272-6cd5efcfe05c', '11fbfff48c563cc2f4203e7d7a1d4ec627baf335cd0d628974a4ecceac3a0c86', '2026-07-27 14:35:05.382396+00', '20260717144843_nc_new_fields', NULL, NULL, '2026-07-27 14:35:05.375724+00', 1);
INSERT INTO public._prisma_migrations VALUES ('367e7de9-70a5-4958-82f5-514312487603', '701556a175b40269de59a049fb2226dec4a9fceb1b77207aee701f2a7e8c0bc7', '2026-07-27 15:16:17.22472+00', '20260727151607_add_nc_tipo', NULL, NULL, '2026-07-27 15:16:17.211347+00', 1);
INSERT INTO public._prisma_migrations VALUES ('0088fa24-de55-44f4-9338-2f999f11c8f7', 'ad84a156aad79dd40a49b57faa381e24a9813d5a07ebcfed4669882013ebdc3a', '2026-07-27 15:19:00.484968+00', '20260727151835_rename_tipo_to_categoria', NULL, NULL, '2026-07-27 15:19:00.445498+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2dcfb43c-c892-4a65-ab6b-b13b5908d309', 'c327b667427fcf064a1bf4aab1ca627c284c5e986958652c0aec9329d067dc48', '2026-07-28 14:53:15.322685+00', '20260714101519_remove_revision_calidad_estado', NULL, NULL, '2026-07-28 14:53:15.303747+00', 1);
INSERT INTO public._prisma_migrations VALUES ('53f26135-18d2-4616-a086-3ff9e57b7e73', '8f5724d66ddcc36edda7d5dfd4fc61190c72ff8bdbb6607a95e819bbe790e667', '2026-07-28 14:53:15.335292+00', '20260714114642_add_firma_digital', NULL, NULL, '2026-07-28 14:53:15.325408+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c354126c-6a61-4769-ac29-95cf7ad1e14e', 'f178604fd2b639d12b8f112d40746f586fa39dfb15ae9204a53544461dea4daf', '2026-08-06 01:16:57.897067+00', '20260805200000_auditoria_programa_campos', NULL, NULL, '2026-08-06 01:16:57.88929+00', 1);
INSERT INTO public._prisma_migrations VALUES ('68ef398d-7019-47a2-bcb6-531ff10f5578', 'fc1af1bdb8e5b8a02ff3abcb9cbc4654532ac21e670f9e2ab6325cba87352b74', '2026-07-28 14:53:15.341599+00', '20260715075547_add_auditoria_detalle', NULL, NULL, '2026-07-28 14:53:15.336769+00', 1);
INSERT INTO public._prisma_migrations VALUES ('f9358544-2242-431d-8543-b141482645f7', 'ec94b54ae60ed5cf1f081bdcafd7fd8d02eecd74cc9bfb37e3694f6ced6a908a', NULL, '20260804190000_nc_general_auditoria_opcional', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260804190000_nc_general_auditoria_opcional

Database error code: 23505

Database error:
ERROR: could not create unique index "no_conformidad_codigo_key"
DETAIL: Key (codigo)=(1) is duplicated.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23505), message: "could not create unique index \"no_conformidad_codigo_key\"", detail: Some("Key (codigo)=(1) is duplicated."), hint: None, position: None, where_: None, schema: Some("public"), table: Some("no_conformidad"), column: None, datatype: None, constraint: Some("no_conformidad_codigo_key"), file: Some("tuplesortvariants.c"), line: Some(1686), routine: Some("comparetup_index_btree_tiebreak") }

   0: sql_schema_connector::apply_migration::apply_script
           with migration_name="20260804190000_nc_general_auditoria_opcional"
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:106
   1: schema_core::commands::apply_migrations::Applying migration
           with migration_name="20260804190000_nc_general_auditoria_opcional"
             at schema-engine\core\src\commands\apply_migrations.rs:91
   2: schema_core::state::ApplyMigrations
             at schema-engine\core\src\state.rs:226', '2026-08-04 18:54:07.265457+00', '2026-08-04 18:53:57.133816+00', 0);
INSERT INTO public._prisma_migrations VALUES ('cff2d701-0e8b-48e4-b467-e2984f32ebbb', '7380ced2f7b0e150ee7b4479dff03fc1953db18f004b09cee2c5dca5047f96c4', '2026-07-28 14:53:15.351338+00', '20260715082537_add_entidad_id_intento_login', NULL, NULL, '2026-07-28 14:53:15.342843+00', 1);
INSERT INTO public._prisma_migrations VALUES ('da49ee58-e974-4c60-8d15-841d0528aed4', '58392fad18afc37b48fd88725db4e5abcbb8c86f867676a79e101cf41a517c70', '2026-07-28 14:53:15.35947+00', '20260717000001_add_configuracion_general', NULL, NULL, '2026-07-28 14:53:15.353343+00', 1);
INSERT INTO public._prisma_migrations VALUES ('44186ba2-4c57-4744-98da-9b46630b159b', '9e859fdebbadd4dd03cc783e16d70919d5f13c91f90533d3424a82144f652e2f', '2026-07-28 14:53:15.369664+00', '20260717111221_add_firma_documento_fase', NULL, NULL, '2026-07-28 14:53:15.361473+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c7d8ffb4-06f6-47da-95ad-b22a695c7004', 'ec94b54ae60ed5cf1f081bdcafd7fd8d02eecd74cc9bfb37e3694f6ced6a908a', '2026-08-04 18:54:36.022718+00', '20260804190000_nc_general_auditoria_opcional', NULL, NULL, '2026-08-04 18:54:35.998243+00', 1);
INSERT INTO public._prisma_migrations VALUES ('879f13c9-23b3-4a35-aff4-094e1f1d7fd2', 'ec58dfc2a994ddc6dc49589fa9954043b04c44c8da19344d7fff538a49d80bad', '2026-08-04 16:41:15.507967+00', '20260804164115_add_plan_accion', NULL, NULL, '2026-08-04 16:41:15.497129+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c2d5c330-d873-468f-8504-d75c170c3a24', 'eedc9af8c8f1bfd3a2e647810775f20189285870b883b57dc5438a97a431e0f6', '2026-08-04 17:32:03.614548+00', '20260804173203_add_archivo_nc', NULL, NULL, '2026-08-04 17:32:03.598319+00', 1);
INSERT INTO public._prisma_migrations VALUES ('236d4bd9-421d-41d5-ad27-7c2b90c42456', 'e2f45a75be2c8f4cccb42eedada6b13c349cf24b6f25ce31cadf311942b2a223', '2026-08-04 18:03:36.239391+00', '20260804175000_nc_codigo_por_auditoria', NULL, NULL, '2026-08-04 18:03:36.225515+00', 1);
INSERT INTO public._prisma_migrations VALUES ('47f1cfa4-89be-412a-917a-2ce245bfc2fe', 'd646d1165ee2d2908f5deafb2c0e642c10543d64780d55fab18c2af802ed5c31', '2026-08-06 21:39:59.322846+00', '20260806230000_formulario_externo', NULL, NULL, '2026-08-06 21:39:59.313291+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9b4960f3-2c40-4519-ad54-a0703874dbdb', '364c0b0eb63e15815bc2cf1da0c0ebc1664f061ef8483e2be3e2573d02eb0675', NULL, '20260804190000_nc_general_auditoria_opcional', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260804190000_nc_general_auditoria_opcional

Database error code: 42601

Database error:
ERROR: syntax error at or near "﻿"

Position:
[1m  0[0m
[1m  1[1;31m ﻿-- DropForeignKey[0m

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42601), message: "syntax error at or near \"\u{feff}\"", detail: None, hint: None, position: Some(Original(1)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("scan.l"), line: Some(1236), routine: Some("scanner_yyerror") }

   0: sql_schema_connector::apply_migration::apply_script
           with migration_name="20260804190000_nc_general_auditoria_opcional"
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:106
   1: schema_core::commands::apply_migrations::Applying migration
           with migration_name="20260804190000_nc_general_auditoria_opcional"
             at schema-engine\core\src\commands\apply_migrations.rs:91
   2: schema_core::state::ApplyMigrations
             at schema-engine\core\src\state.rs:226', '2026-08-04 18:53:55.886502+00', '2026-08-04 18:53:39.345949+00', 0);
INSERT INTO public._prisma_migrations VALUES ('b36c6290-55dd-4d8e-bc6c-22ec5c7430ce', 'd1ad311930b7a061d2a4fa39d0a2f9ad49429328816222e9fbc1ae65dd0f2d94', '2026-08-06 16:34:17.728727+00', '20260806100000_verificacion_eficacia_nc', NULL, NULL, '2026-08-06 16:34:17.71587+00', 1);
INSERT INTO public._prisma_migrations VALUES ('f39e5ea1-081c-4d4c-8c21-91109899e48f', 'a88a07aa3dcdba3b9af1bf4ab1379acc8922a7fd9a9d409da26fe8ac8e4b229f', '2026-08-06 16:47:32.759957+00', '20260806200000_nc_codigo_por_auditoria', NULL, NULL, '2026-08-06 16:47:32.736884+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c95ef78a-150d-4356-a289-291638c27796', 'cf8d306b1b66e88b3de84b297514ad3484b72600637db153aba98bdeaa4476f6', '2026-08-06 17:36:00.300992+00', '20260806210000_nc_historial', NULL, NULL, '2026-08-06 17:36:00.254735+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b2634537-d309-47f4-98fe-66e6f3056326', 'c18719c281776cf95049c0ea2f1b09dd196308d505b40576d45ab00b55a28f9a', '2026-08-07 00:12:20.161968+00', '20260806240000_auditoria_campos_opcionales', NULL, NULL, '2026-08-07 00:12:20.130958+00', 1);
INSERT INTO public._prisma_migrations VALUES ('731aa977-e74d-4b89-a8b2-f0e48239c580', '590cf1d9ce94b21b5fbf7ce345c33722a644e3b169a970cb11de386e49e1b25e', '2026-08-06 21:39:59.30956+00', '20260806220000_auditoria_historial', NULL, NULL, '2026-08-06 21:39:59.260571+00', 1);
INSERT INTO public._prisma_migrations VALUES ('57ee6ff4-e51e-4a9a-99aa-3d2db74e19d7', '5d968ba3de3f4fef1eb7f42c5001c2894ca81f9141711341c1be1ed9236966e5', '2026-08-07 01:52:48.2527+00', '20260806260000_eliminar_numero_sae', NULL, NULL, '2026-08-07 01:52:48.235357+00', 1);
INSERT INTO public._prisma_migrations VALUES ('c212be38-0b3b-44ec-a187-ff172b3a2484', '065c824fb1709e58ce587c9342d2df6760c6194df810e7b56e12ec0fd468b3be', '2026-08-07 01:21:34.484256+00', '20260806250000_auditoria_externa_campos_sae', NULL, NULL, '2026-08-07 01:21:34.465163+00', 1);
INSERT INTO public._prisma_migrations VALUES ('ff8566c3-06b9-4b0d-aea9-bad104c878ad', '99347970764dc910a4e61f9689469900e5aec389c18220cd2ec200d6ad68d32d', '2026-08-12 17:14:31.719667+00', '20260812000000_riesgos_oportunidades', NULL, NULL, '2026-08-12 17:14:31.700915+00', 1);
INSERT INTO public._prisma_migrations VALUES ('436ea4c8-df31-4858-accc-e61e70c4d64c', '9c319bec3ac9b817ba19c9d15a3ab3f456bdb70d39e1088dcf2f076869b45ac2', '2026-08-12 17:42:29.821166+00', '20260812010000_quejas', NULL, NULL, '2026-08-12 17:42:29.805342+00', 1);
INSERT INTO public._prisma_migrations VALUES ('8fa577c3-08be-41fd-89fd-3fbea283ef9b', '493584d802bf2d561965029047952a6bdb9400743437387b5efd485fa2e39d46', NULL, '20260817020000_add_quejas', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260817020000_add_quejas

Database error code: 42710

Database error:
ERROR: type "EstadoQueja" already exists

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \"EstadoQueja\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1211), routine: Some("DefineEnum") }

   0: sql_schema_connector::apply_migration::apply_script
           with migration_name="20260817020000_add_quejas"
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:106
   1: schema_core::commands::apply_migrations::Applying migration
           with migration_name="20260817020000_add_quejas"
             at schema-engine\core\src\commands\apply_migrations.rs:91
   2: schema_core::state::ApplyMigrations
             at schema-engine\core\src\state.rs:226', '2026-08-18 01:04:39.434242+00', '2026-08-18 01:04:30.128412+00', 0);
INSERT INTO public._prisma_migrations VALUES ('099a6891-7dae-4dc5-8ddd-6d8256c5ec2c', '493584d802bf2d561965029047952a6bdb9400743437387b5efd485fa2e39d46', '2026-08-18 01:04:39.445406+00', '20260817020000_add_quejas', '', NULL, '2026-08-18 01:04:39.445406+00', 0);
INSERT INTO public._prisma_migrations VALUES ('ed8a0f91-36e1-4b0e-865c-02b9854e1b31', '237110ef18e46ac4910a8791edb5897ea8fc922238bba36222a2d414d8eb4ede', '2026-08-18 01:04:49.127571+00', '20260817030000_add_queja_responsables', NULL, NULL, '2026-08-18 01:04:49.070611+00', 1);
INSERT INTO public._prisma_migrations VALUES ('6b4b2d87-d1ad-4f28-948e-facc227ba6b3', 'a1d267ba771a0d0895170f0ac5a600910649f831d33944ea8e3911a6f66bd3ed', '2026-08-18 01:39:15.727736+00', '20260817040000_add_riesgo_responsables', NULL, NULL, '2026-08-18 01:39:15.699612+00', 1);


--
-- Data for Name: aplicacion; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.aplicacion VALUES (1, 'Gestion de Usuarios', 'Módulo de administración de roles y credenciales', true);
INSERT INTO public.aplicacion VALUES (2, 'Recursos Humanos', 'Gestión de personal, puestos y estructura organizacional', true);
INSERT INTO public.aplicacion VALUES (3, 'Gestor Documental', 'Archivos, carpetas y flujos documentales', true);
INSERT INTO public.aplicacion VALUES (4, 'Laboratorios', 'Gestión de laboratorios, equipos y servicios', true);
INSERT INTO public.aplicacion VALUES (5, 'Auditoria Global', 'Registro de actividades del sistema', true);
INSERT INTO public.aplicacion VALUES (6, 'Recepcion Equipos', 'Módulo de recepción y seguimiento de equipos', true);
INSERT INTO public.aplicacion VALUES (7, 'Gestion de Calidad', 'Auditorías internas, no conformidades y acciones correctivas', true);


--
-- Data for Name: carpetas; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.carpetas VALUES (1, 'externo', 'LIBRERIA', 10, true, '2026-07-28 15:04:44.59', '2026-07-28 15:04:44.59', NULL, '', '', NULL, '1');
INSERT INTO public.carpetas VALUES (2, 'pele', 'AREA', 10, true, '2026-07-28 15:04:50.949', '2026-07-28 15:04:50.949', 1, '', '', NULL, '1');
INSERT INTO public.carpetas VALUES (3, 'interno', 'SUBCARPETA', 10, true, '2026-07-28 15:05:00.12', '2026-07-28 15:05:00.12', 2, '', '', NULL, '1');


--
-- Data for Name: circuitos; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.circuitos VALUES (1, 'CALIDA', true);


--
-- Data for Name: documentos; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.documentos VALUES (2, NULL, 'RCR1785208226630581', 'uploads/Gestor_Documental/externo/pele/interno/RCR1785208226630581.pdf', '1', 0, true, '2026-07-28 15:06:02.626', '2026-07-28 15:06:02.626', 3, 'Centro de Metrología del Ejército Ecuatoriano', '2026-07-28', 'Miguel Sangucho', 1);
INSERT INTO public.documentos VALUES (4, NULL, 'GD2.1.P1_GESTION_DE_DOCUMENTOS', 'uploads/Gestor_Documental/externo/pele/interno/firma_3_documento_firmado.pdf', '1', 0, true, '2026-08-05 20:40:38.804', '2026-08-05 20:49:51.718', 3, 'Centro de Metrología del Ejército Ecuatoriano', '2026-08-05', 'Miguel Sangucho', 1);
INSERT INTO public.documentos VALUES (5, NULL, 'ActaFiniquito', 'uploads/Gestor_Documental/externo/pele/interno/firma_6_documento_firmado.pdf', '1', 0, true, '2026-08-06 20:31:11.266', '2026-08-06 20:34:48.054', 3, 'Centro de Metrología del Ejército Ecuatoriano', '2026-08-06', 'Miguel Sangucho', 1);


--
-- Data for Name: puesto; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.puesto VALUES (1, 'LPR', 'director', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', NULL, 0, true, '2026-07-28', '2026-07-28 15:04:18.009+00', '2026-07-28 15:04:18.009+00');
INSERT INTO public.puesto VALUES (2, 'DCM', 'Director del CMEE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.112+00', '2026-08-06 14:55:37.112+00');
INSERT INTO public.puesto VALUES (3, 'JDC', 'Jefe Departamento Gestión de la Calidad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.123+00', '2026-08-06 14:55:37.123+00');
INSERT INTO public.puesto VALUES (4, 'RSEC', 'Responsable servicio al Cliente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.127+00', '2026-08-06 14:55:37.127+00');
INSERT INTO public.puesto VALUES (5, 'JDT', 'Jefe de Departamento Técnico', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.13+00', '2026-08-06 14:55:37.13+00');
INSERT INTO public.puesto VALUES (6, 'OBT', 'Observador Técnico', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.133+00', '2026-08-06 14:55:37.133+00');
INSERT INTO public.puesto VALUES (7, 'RET', 'Responsable Técnico', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, true, '2026-07-07', '2026-08-06 14:55:37.136+00', '2026-08-06 14:55:37.136+00');


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.auditoria VALUES (1, 1, 'GRUPOS', 'Consulta de recurso', 'Endpoint: GET /api/grupos/1', NULL, NULL, '2026-07-27 15:05:12.784+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (8, 1, 'CALIDAD', 'Creación de recurso', 'Endpoint: POST /api/calidad/auditorias', NULL, NULL, '2026-07-27 15:07:22.725+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (2, 1, 'GRUPOS', 'Consulta de recurso', 'Endpoint: GET /api/grupos/1', NULL, NULL, '2026-07-27 15:05:12.784+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (3, 1, 'GRUPOS', 'Consulta de recurso', 'Endpoint: GET /api/grupos/1', NULL, NULL, '2026-07-27 15:06:04.193+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (6, 1, 'GRUPOS', 'Edición de recurso', 'Endpoint: PATCH /api/grupos/1', NULL, NULL, '2026-07-27 15:06:37.584+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (4, 1, 'GRUPOS', 'Consulta de recurso', 'Endpoint: GET /api/grupos/1', NULL, NULL, '2026-07-27 15:06:04.193+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (5, 1, 'GRUPOS', 'Edición de recurso', 'Endpoint: PATCH /api/grupos/1', NULL, NULL, '2026-07-27 15:06:37.584+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (7, 1, 'CALIDAD', 'Creación de recurso', 'Endpoint: POST /api/calidad/auditorias', NULL, NULL, '2026-07-27 15:07:22.725+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (9, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:14:44.85+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (10, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:14:44.85+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (11, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:17:05.72+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (12, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:17:05.72+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (13, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:17:14.748+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (14, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:17:14.749+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (15, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:20:06.778+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (16, 1, 'CALIDAD', 'Consulta de recurso', 'Endpoint: GET /api/calidad/auditorias/1', NULL, NULL, '2026-07-27 15:20:06.778+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (17, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 14:59:57.257+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (18, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 14:59:57.257+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (19, 1, 'DEPARTAMENTOS', 'Creación de recurso', 'Creación en Departamentos — calidad', NULL, NULL, '2026-07-28 15:01:01.593+00', NULL, NULL, '{"nombre":"calidad","descripcion":"","codigo":"cd","orden":0,"tipo":"Departamento","responsable_id":1,"activo":true}', NULL);
INSERT INTO public.auditoria VALUES (20, 1, 'DEPARTAMENTOS', 'Creación de recurso', 'Creación en Departamentos — calidad', NULL, NULL, '2026-07-28 15:01:01.593+00', NULL, NULL, '{"nombre":"calidad","descripcion":"","codigo":"cd","orden":0,"tipo":"Departamento","responsable_id":1,"activo":true}', NULL);
INSERT INTO public.auditoria VALUES (21, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:43.986+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (22, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:43.986+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (24, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:49.652+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (23, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:49.652+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (25, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:55.894+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (26, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:01:55.894+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (27, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:35.866+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (28, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:35.866+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (30, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:38.111+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (29, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:38.111+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (32, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-07-28 15:02:46.29+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (31, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-07-28 15:02:46.29+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (34, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:46.322+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (33, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:02:46.322+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (36, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:49.646+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (35, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:49.646+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (37, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:56.933+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (38, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:56.933+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (39, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:59.62+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (40, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:02:59.62+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (41, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:03:02.834+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (42, 1, 'DEPARTAMENTOS', 'Consulta de recurso', 'Consulta en Departamentos #1', NULL, NULL, '2026-07-28 15:03:02.834+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (43, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:03:27.617+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (44, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:03:27.617+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (45, 1, 'PUESTOS', 'Creación de recurso', 'Creación en Puestos — director', NULL, NULL, '2026-07-28 15:04:18.014+00', NULL, NULL, '{"codigo":"LPR","nombre":"director","educacion":"","formacion":"","habilidad":"","experiencia":"","conocimiento_tecnico":"","calificacion":"","autoridad":"","responsabilidades":"","funcion_principal":"","funciones_alternas":"","funciones":"","perfil_educacion_indispensable":"","perfil_formacion_deseable":"","perfil_capacidades_deseable":"","perfil_experiencia_deseable":"","orden":0,"activo":true}', NULL);
INSERT INTO public.auditoria VALUES (46, 1, 'PUESTOS', 'Creación de recurso', 'Creación en Puestos — director', NULL, NULL, '2026-07-28 15:04:18.014+00', NULL, NULL, '{"codigo":"LPR","nombre":"director","educacion":"","formacion":"","habilidad":"","experiencia":"","conocimiento_tecnico":"","calificacion":"","autoridad":"","responsabilidades":"","funcion_principal":"","funciones_alternas":"","funciones":"","perfil_educacion_indispensable":"","perfil_formacion_deseable":"","perfil_capacidades_deseable":"","perfil_experiencia_deseable":"","orden":0,"activo":true}', NULL);
INSERT INTO public.auditoria VALUES (47, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:04:20.748+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (48, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:04:20.748+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (49, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-07-28 15:04:26.826+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (50, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-07-28 15:04:26.826+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (51, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:04:28.845+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (52, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-07-28 15:04:28.845+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (53, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — externo', NULL, NULL, '2026-07-28 15:04:44.608+00', NULL, NULL, '{"nombre":"externo","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"LIBRERIA","permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (54, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — externo', NULL, NULL, '2026-07-28 15:04:44.608+00', NULL, NULL, '{"nombre":"externo","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"LIBRERIA","permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (55, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — pele', NULL, NULL, '2026-07-28 15:04:50.969+00', NULL, NULL, '{"nombre":"pele","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"AREA","carpeta_padre_id":1,"permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (59, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-07-28 15:05:10.636+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (121, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:29.551+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (56, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — pele', NULL, NULL, '2026-07-28 15:04:50.969+00', NULL, NULL, '{"nombre":"pele","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"AREA","carpeta_padre_id":1,"permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (57, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — interno', NULL, NULL, '2026-07-28 15:05:00.139+00', NULL, NULL, '{"nombre":"interno","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"SUBCARPETA","carpeta_padre_id":2,"permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (60, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-07-28 15:05:10.636+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (58, 1, 'CARPETAS', 'Creación de recurso', 'Creación en Carpetas — interno', NULL, NULL, '2026-07-28 15:05:00.139+00', NULL, NULL, '{"nombre":"interno","descripcion":"","codigo":"","orden":10,"version_inicial":"1","activo":true,"tipo":"SUBCARPETA","carpeta_padre_id":2,"permisos":[{"persona_id":1,"nivel_permiso":5,"permiso_docs":true,"permiso_carpetas":true,"permiso_extra":true}]}', NULL);
INSERT INTO public.auditoria VALUES (61, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — CALIDA', NULL, NULL, '2026-07-28 15:05:18.781+00', NULL, NULL, '{"nombre":"CALIDA","activo":true}', NULL);
INSERT INTO public.auditoria VALUES (62, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — CALIDA', NULL, NULL, '2026-07-28 15:05:18.781+00', NULL, NULL, '{"nombre":"CALIDA","activo":true}', NULL);
INSERT INTO public.auditoria VALUES (63, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — ELABORCION', NULL, NULL, '2026-07-28 15:05:28.18+00', NULL, NULL, '{"nombre":"ELABORCION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[1]}', NULL);
INSERT INTO public.auditoria VALUES (64, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — ELABORCION', NULL, NULL, '2026-07-28 15:05:28.18+00', NULL, NULL, '{"nombre":"ELABORCION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[1]}', NULL);
INSERT INTO public.auditoria VALUES (65, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — APROBACION', NULL, NULL, '2026-07-28 15:05:35.159+00', NULL, NULL, '{"nombre":"APROBACION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[]}', NULL);
INSERT INTO public.auditoria VALUES (66, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — APROBACION', NULL, NULL, '2026-07-28 15:05:35.159+00', NULL, NULL, '{"nombre":"APROBACION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[]}', NULL);
INSERT INTO public.auditoria VALUES (67, 1, 'CIRCUITOS', 'Consulta de recurso', 'Consulta en Circuitos #2', NULL, NULL, '2026-07-28 15:05:36.994+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (68, 1, 'CIRCUITOS', 'Consulta de recurso', 'Consulta en Circuitos #2', NULL, NULL, '2026-07-28 15:05:36.994+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (69, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — APROBACION', NULL, NULL, '2026-07-28 15:05:41.827+00', NULL, NULL, '{"id":2,"nombre":"APROBACION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[1]}', NULL);
INSERT INTO public.auditoria VALUES (70, 1, 'CIRCUITOS', 'Creación de recurso', 'Creación en Circuitos — APROBACION', NULL, NULL, '2026-07-28 15:05:41.827+00', NULL, NULL, '{"id":2,"nombre":"APROBACION","orden":10,"etiqueta_singular":"","etiqueta_plural":"","individual_paralelo":false,"mostrar_hora":true,"ocultar_enviar_correo":false,"activo":true,"en_vigor":false,"obligatorio_todos":false,"usuarios_asignados":[1]}', NULL);
INSERT INTO public.auditoria VALUES (75, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-07-28 15:06:02.648+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (76, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-07-28 15:06:02.648+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (77, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-07-28 15:06:03.667+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (78, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-07-28 15:06:03.667+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (79, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:26:30.459+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (80, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:26:30.459+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (81, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:28:31.947+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (82, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:28:31.947+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (83, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:08.918+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (84, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:08.918+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (85, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:12.864+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (86, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:12.864+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (88, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:21.869+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (87, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:39:21.869+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (89, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 1', NULL, NULL, '2026-07-28 16:44:04.658+00', NULL, NULL, '{"codigo":"1","categoria":"NC","requisito":"NC\t01\tNTE INEN ISO/IEC 17025 2018, requisito 5.5 b","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los resultados.","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (91, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:44:04.684+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (123, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:25:05.854+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (124, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:25:05.854+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (125, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:25:09.856+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (126, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:25:09.856+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (127, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:28:52.128+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (128, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:28:52.128+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (129, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:28:54.725+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (130, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:28:54.725+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (131, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:30:16.965+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (132, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:30:16.965+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (133, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:30:23.057+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (134, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:30:23.057+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (90, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 1', NULL, NULL, '2026-07-28 16:44:04.658+00', NULL, NULL, '{"codigo":"1","categoria":"NC","requisito":"NC\t01\tNTE INEN ISO/IEC 17025 2018, requisito 5.5 b","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los resultados.","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (92, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:44:04.684+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (93, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:25.387+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (94, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:25.387+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (96, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:29.799+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (95, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:29.799+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (97, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:35.319+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (98, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:53:35.319+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (99, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:54:37.808+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (100, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:54:37.808+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (101, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:56:47.846+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (102, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:56:47.846+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (103, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:56:54.853+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (104, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:56:54.853+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (105, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:13.769+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (106, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:13.769+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (107, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:53.665+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (108, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:53.665+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (109, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:55.772+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (110, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 16:58:55.772+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (111, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:04:24.878+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (112, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:04:24.878+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (113, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:22.98+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (114, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:22.98+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (115, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:24.063+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (116, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:24.063+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (117, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — 1', NULL, NULL, '2026-07-28 17:22:27.969+00', NULL, NULL, '{"codigo":"1","categoria":"NC","requisito":"NC\t01\tNTE INEN ISO/IEC 17025 2018, requisito 5.5 b","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los ","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.","aceptada_oec":false,"reiterada":false}', 1);
INSERT INTO public.auditoria VALUES (118, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — 1', NULL, NULL, '2026-07-28 17:22:27.969+00', NULL, NULL, '{"codigo":"1","categoria":"NC","requisito":"NC\t01\tNTE INEN ISO/IEC 17025 2018, requisito 5.5 b","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los ","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.","aceptada_oec":false,"reiterada":false}', 1);
INSERT INTO public.auditoria VALUES (119, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:27.995+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (120, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:27.995+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (122, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:22:29.551+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (136, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 10', NULL, NULL, '2026-07-28 17:31:01.155+00', NULL, NULL, '{"codigo":"10","categoria":"NC","requisito":"NTE INEN ISO/IEC 17025 2018, requisito 7.7.1","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los resultados.","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.\n","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (138, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:31:01.205+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (139, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 17:31:05.453+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (135, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 10', NULL, NULL, '2026-07-28 17:31:01.155+00', NULL, NULL, '{"codigo":"10","categoria":"NC","requisito":"NTE INEN ISO/IEC 17025 2018, requisito 7.7.1","hallazgo":"El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los resultados.","evidencia":"1)\tEn el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.\n\n2)\tEl laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.\n\n3)\tNo se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.\n","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (137, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:31:01.205+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (140, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 17:31:05.453+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (141, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 17:37:40.363+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (142, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 17:37:40.363+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (143, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:37:57.468+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (144, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 17:37:57.468+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (145, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 19:59:40.126+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (146, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-28 19:59:40.126+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (147, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 20:01:05.987+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (148, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-28 20:01:05.987+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (149, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-29 17:01:47.902+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (150, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-07-29 17:01:47.902+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (151, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-29 17:01:50.834+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (152, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-29 17:01:50.833+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (153, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-29 18:01:33.097+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (154, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-07-29 18:01:33.097+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (155, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:19.691+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (156, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:19.691+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (157, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:22.404+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (158, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:22.404+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (159, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:25.734+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (160, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:25.734+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (161, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:27.874+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (162, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:27.874+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (163, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:29.752+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (164, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 15:22:29.753+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (165, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:30.66+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (166, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 15:22:30.66+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (167, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #2', NULL, NULL, '2026-08-04 16:45:46.767+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><br></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p> Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p><p><br></p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"correccion":"","evidencia":"","fecha":"","observaciones":"","ob":""}],"accionesCorrectivas":[{"accion":"","evidencia":"","fecha":"","observaciones":"","ob":""}]}}', 2);
INSERT INTO public.auditoria VALUES (170, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:45:46.793+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (239, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:38.372+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (245, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:18:05.11+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (302, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:28:44.337+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (304, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:32:41.968+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (306, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:32:47.953+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (305, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:32:47.953+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (307, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:35:53.94+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (308, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:35:53.94+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (309, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:35:55.21+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (310, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:35:55.209+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (311, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:36:00.044+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (168, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #2', NULL, NULL, '2026-08-04 16:45:46.767+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><br></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p> Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p><p><br></p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"correccion":"","evidencia":"","fecha":"","observaciones":"","ob":""}],"accionesCorrectivas":[{"accion":"","evidencia":"","fecha":"","observaciones":"","ob":""}]}}', 2);
INSERT INTO public.auditoria VALUES (169, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:45:46.793+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (171, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:56:45.579+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (172, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:56:45.579+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (173, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:19.645+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (174, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:19.645+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (176, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:30.598+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (175, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:30.598+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (177, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:43.174+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (178, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:43.174+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (179, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:45.658+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (180, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:45.658+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (181, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:48.118+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (182, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:48.118+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (183, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:49.714+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (184, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 16:59:49.714+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (185, 1, 'CALIDAD', 'Eliminación lógica de recurso', 'Eliminación lógica en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:51.477+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (186, 1, 'CALIDAD', 'Eliminación lógica de recurso', 'Eliminación lógica en CALIDAD #2', NULL, NULL, '2026-08-04 16:59:51.477+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (187, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 2', NULL, NULL, '2026-08-04 17:00:52.135+00', NULL, NULL, '{"codigo":"2","categoria":"NC","requisito":"NTE INEN ISO/IEC 17025 2018, requisito 7.7.1","hallazgo":"El laboratorio no conserva todos los registros para autorizar al personal y realizar el seguimiento a su competencia o presenta deficiencias ","evidencia":"No hay relación de los resultados de la evaluación psicológica del Jefe de Calidad (JDC) respecto a los requisitos establecidos en el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2. \n\nEn la Matriz de evaluación. GT1.P2 no se incluye el seguimiento de las habilidades. \n","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (188, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD — 2', NULL, NULL, '2026-08-04 17:00:52.135+00', NULL, NULL, '{"codigo":"2","categoria":"NC","requisito":"NTE INEN ISO/IEC 17025 2018, requisito 7.7.1","hallazgo":"El laboratorio no conserva todos los registros para autorizar al personal y realizar el seguimiento a su competencia o presenta deficiencias ","evidencia":"No hay relación de los resultados de la evaluación psicológica del Jefe de Calidad (JDC) respecto a los requisitos establecidos en el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2. \n\nEn la Matriz de evaluación. GT1.P2 no se incluye el seguimiento de las habilidades. \n","aceptada_oec":false,"reiterada":false,"auditoria_id":1}', NULL);
INSERT INTO public.auditoria VALUES (189, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:00:52.157+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (190, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:00:52.157+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (191, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:00:53.618+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (192, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:00:53.618+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (193, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:14.305+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p>  <strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><strong>&nbsp;</strong></p><p>  </p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p> Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p><p><br></p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"correccion":"","evidencia":"","fecha":"","observaciones":"","ob":""}],"accionesCorrectivas":[{"accion":"","evidencia":"","fecha":"","observaciones":"","ob":""}]}}', 3);
INSERT INTO public.auditoria VALUES (196, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:14.332+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (197, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:01:35.708+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (199, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:38.503+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (301, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:28:44.337+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (303, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:32:41.968+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (194, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:14.305+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p>  <strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><strong>&nbsp;</strong></p><p>  </p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p> Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p><p><br></p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"correccion":"","evidencia":"","fecha":"","observaciones":"","ob":""}],"accionesCorrectivas":[{"accion":"","evidencia":"","fecha":"","observaciones":"","ob":""}]}}', 3);
INSERT INTO public.auditoria VALUES (195, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:14.332+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (198, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:01:35.708+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (200, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:01:38.503+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (201, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:06:57.006+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (202, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:06:57.006+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (203, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:31.548+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (204, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:31.548+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (205, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:35.024+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (206, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:35.024+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (208, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:38.572+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (207, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:38.572+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (209, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:08:44.989+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (210, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:08:44.989+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (211, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:49.16+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (212, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:08:49.16+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (213, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:10.691+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (214, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:10.691+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (215, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:12.912+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (216, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:12.912+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (217, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:28.146+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (218, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:28.147+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (219, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:36.133+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (220, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:09:36.133+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (221, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:10:02.618+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (222, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:10:02.618+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (223, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:14:17.91+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (224, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:14:17.91+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (225, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:14:20.698+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (226, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:14:20.698+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (227, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:15:55.943+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (228, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:15:55.943+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (229, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:16:01.093+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (230, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:16:01.093+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (231, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:21.15+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (232, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:21.15+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (233, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:23.504+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (234, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:23.504+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (236, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:30.362+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><strong>&nbsp;</strong></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p>Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"ob":"","fecha":"","evidencia":"","correccion":"","observaciones":""}],"accionesCorrectivas":[{"ob":"","fecha":"","accion":"","evidencia":"","observaciones":""}]}}', 3);
INSERT INTO public.auditoria VALUES (237, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:30.399+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (235, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:30.362+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidad.</p><p><strong>&nbsp;</strong></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p>Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"ob":"","fecha":"","evidencia":"","correccion":"","observaciones":""}],"accionesCorrectivas":[{"ob":"","fecha":"","accion":"","evidencia":"","observaciones":""}]}}', 3);
INSERT INTO public.auditoria VALUES (238, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:30.399+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (240, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:38.372+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (242, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:41.823+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidadd.</p><p><strong>&nbsp;</strong></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p>Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"ob":"","fecha":"","evidencia":"","correccion":"","observaciones":""}],"accionesCorrectivas":[{"ob":"","fecha":"","accion":"","evidencia":"","observaciones":""}]}}', 3);
INSERT INTO public.auditoria VALUES (244, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:41.863+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (241, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:41.823+00', NULL, NULL, '{"plan_accion":{"analisisExtension":"<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidadd.</p><p><strong>&nbsp;</strong></p>","obExtension":"","analisisCausa":"<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p>Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p>","obCausa":"","causaRaiz":"<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>","correcciones":[{"ob":"","fecha":"","evidencia":"","correccion":"","observaciones":""}],"accionesCorrectivas":[{"ob":"","fecha":"","accion":"","evidencia":"","observaciones":""}]}}', 3);
INSERT INTO public.auditoria VALUES (243, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 17:17:41.863+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (246, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 17:18:05.11+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (247, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:39:10.085+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (248, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:39:10.085+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (249, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:39:14.796+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (250, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:39:14.796+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (251, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:40:24.569+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (252, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:40:24.569+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (253, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.095+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (254, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.095+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (255, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.123+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (256, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.123+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (257, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.146+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (258, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:19.146+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (259, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:46.658+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (260, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:48:46.658+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (261, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:49:55.116+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (262, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 17:49:55.116+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (263, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #14', NULL, NULL, '2026-08-04 17:49:55.188+00', NULL, NULL, NULL, 14);
INSERT INTO public.auditoria VALUES (264, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #14', NULL, NULL, '2026-08-04 17:49:55.188+00', NULL, NULL, NULL, 14);
INSERT INTO public.auditoria VALUES (265, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:50:51.479+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (266, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 17:50:51.479+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (267, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:34.95+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (268, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:34.95+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (269, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.091+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (270, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.091+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (271, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.115+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (272, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.115+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (273, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.142+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (274, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:05:35.142+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (275, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:07:47.912+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (276, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:07:47.912+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (277, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:16:44.261+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (278, 1, 'CALIDAD', 'Creación de recurso', 'Creación en CALIDAD', NULL, NULL, '2026-08-04 18:16:44.261+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (279, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:16:44.329+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (280, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:16:44.329+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (281, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:16:47.429+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (282, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:16:47.429+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (283, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:17:05.424+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (284, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:17:05.424+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (285, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #23', NULL, NULL, '2026-08-04 18:19:22.125+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (286, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #23', NULL, NULL, '2026-08-04 18:19:22.125+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (287, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:19:22.156+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (288, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:19:22.156+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (289, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:26:22.46+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (290, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:26:22.46+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (291, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:26:28.64+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (292, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:26:28.64+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (294, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:26:30.021+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (293, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:26:30.021+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (295, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:26:31.393+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (296, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:26:31.393+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (297, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:27:12.447+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (298, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:27:12.447+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (299, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:27:18.32+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (300, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:27:18.32+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (312, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #23', NULL, NULL, '2026-08-04 18:36:00.044+00', NULL, NULL, NULL, 23);
INSERT INTO public.auditoria VALUES (314, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:36:19.433+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (316, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:36:21.939+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (318, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 18:36:23.106+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (322, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 18:36:31.491+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (313, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 18:36:19.433+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (317, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 18:36:23.105+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (319, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:36:24.399+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (315, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:36:21.939+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (320, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-04 18:36:24.399+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (321, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 18:36:31.491+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (323, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 19:18:30.996+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (324, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-04 19:18:30.996+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (325, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 19:18:35.961+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (326, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 19:18:35.961+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (327, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 19:28:52.893+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (328, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-04 19:28:52.893+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (329, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-05 14:57:17.991+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (330, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-05 14:57:17.991+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (331, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-05 17:31:17.854+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (332, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-05 17:31:17.852+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (333, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-05 17:31:23.353+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (334, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-05 17:31:23.353+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (336, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-05 17:31:25.097+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (335, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-05 17:31:25.097+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (337, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-05 17:52:02.097+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (338, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-05 17:52:02.098+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (339, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-05 19:22:13.384+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (340, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-05 19:22:13.384+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (341, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:21:10.038+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (342, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:21:10.039+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (349, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:40:38.832+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (350, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:40:38.832+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (351, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:43:14.096+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (352, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:43:14.096+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (353, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:47:50.134+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (354, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:47:50.134+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (355, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:49:16.572+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (356, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:49:16.572+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (357, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:49:51.752+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (358, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-05 20:49:51.752+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (359, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:49:51.773+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (360, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-05 20:49:51.773+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (361, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-06 03:32:20.765+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (362, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-06 03:32:20.765+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (363, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-08-06 03:32:30.638+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (364, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-08-06 03:32:30.638+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (365, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-08-06 03:33:29.909+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (366, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #2', 2, NULL, '2026-08-06 03:33:29.909+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (367, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-06 03:33:33.425+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (368, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #4', 4, NULL, '2026-08-06 03:33:33.425+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (369, 1, 'AUDITORIA', 'Consulta de recurso', 'Consulta en Auditoría #4', NULL, NULL, '2026-08-06 03:33:36.996+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (370, 1, 'AUDITORIA', 'Consulta de recurso', 'Consulta en Auditoría #4', NULL, NULL, '2026-08-06 03:33:36.996+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (371, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 12:52:56.861+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (372, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 12:52:56.86+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (373, 1, 'NOTIFICACIONES', 'Edición de recurso', 'Edición en Notificaciones', NULL, NULL, '2026-08-06 12:53:29.958+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (374, 1, 'NOTIFICACIONES', 'Edición de recurso', 'Edición en Notificaciones', NULL, NULL, '2026-08-06 12:53:29.958+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (376, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 14:40:02.715+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (375, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 14:40:02.715+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (377, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:43:03.529+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (378, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:43:03.529+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (379, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:45:10.162+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (380, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:45:10.162+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (382, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:47:14.61+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (381, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:47:14.61+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (383, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:47:20.047+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (384, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:47:20.047+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (385, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:48:23.43+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (386, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #4', NULL, NULL, '2026-08-06 14:48:23.43+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (387, 1, 'PUESTOS', 'Consulta de recurso', 'Consulta en Puestos #3', NULL, NULL, '2026-08-06 14:57:04.614+00', 3, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (388, 1, 'PUESTOS', 'Consulta de recurso', 'Consulta en Puestos #3', NULL, NULL, '2026-08-06 14:57:04.614+00', 3, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (389, 1, 'CALIDAD', 'Eliminación lógica de recurso', 'Eliminación lógica en CALIDAD #4', NULL, NULL, '2026-08-06 16:24:17.678+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (390, 1, 'CALIDAD', 'Eliminación lógica de recurso', 'Eliminación lógica en CALIDAD #4', NULL, NULL, '2026-08-06 16:24:17.678+00', NULL, NULL, NULL, 4);
INSERT INTO public.auditoria VALUES (391, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:27:33.359+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (392, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:27:33.36+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (393, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:27:58.885+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (394, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:27:58.885+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (396, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #5', NULL, NULL, '2026-08-06 16:28:07.508+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (395, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #5', NULL, NULL, '2026-08-06 16:28:07.508+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (397, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:28:08.96+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (398, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:28:08.96+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (399, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:44:28.198+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (400, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:44:28.198+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (402, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:44:33.685+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (401, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:44:33.685+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (403, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-06 16:44:39.772+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (404, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-06 16:44:39.772+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (405, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 16:44:42.231+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (406, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 16:44:42.231+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (407, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 16:57:04.941+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (408, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 16:57:04.941+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (409, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-06 16:57:08.186+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (410, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-06 16:57:08.186+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (411, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:57:11.485+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (412, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 16:57:11.485+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (414, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 16:57:18.706+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (413, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 16:57:18.706+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (415, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:01:47.117+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (416, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:01:47.117+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (417, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:02:37.045+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (418, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:02:37.045+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (419, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 17:02:48.353+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (420, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-06 17:02:48.353+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (421, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:03:14.089+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (422, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:03:14.089+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (423, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:16.608+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (424, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:16.608+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (426, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:19.34+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (425, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:19.34+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (427, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:33.565+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (428, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:33.565+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (429, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:33.597+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (430, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:33.597+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (431, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:36.534+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (432, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:03:36.534+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (433, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-08-06 17:04:10.005+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (434, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-08-06 17:04:10.005+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (435, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-08-06 17:04:20.528+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (436, 1, 'PERSONAS', 'Edición de recurso', 'Edición en Personas #1', NULL, 1, '2026-08-06 17:04:20.529+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (438, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-08-06 17:04:20.566+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (437, 1, 'PERSONAS', 'Consulta de recurso', 'Consulta en Personas #1', NULL, 1, '2026-08-06 17:04:20.566+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (439, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:10:23.71+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (440, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:10:23.71+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (441, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:27.016+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (442, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:27.016+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (443, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:29.084+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (444, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:29.084+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (445, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:39.673+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (446, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:39.673+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (447, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:39.704+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (448, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:10:39.704+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (450, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:59:19.783+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (449, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:59:19.783+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (451, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:59:35.259+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (452, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 17:59:35.259+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (453, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:59:40.979+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (454, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 17:59:40.979+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (455, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 18:00:27.066+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (456, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 18:00:27.066+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (457, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 18:05:45.879+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (458, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 18:05:45.879+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (459, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:20:42.083+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (460, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:20:42.083+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (461, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:31:11.303+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (462, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:31:11.303+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (463, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:31:12.673+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (464, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:31:12.673+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (465, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:11.052+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (466, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:11.052+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (468, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:21.233+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (467, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:21.233+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (469, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:32:44.432+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (470, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:32:44.432+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (472, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:44.453+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (471, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:32:44.453+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (473, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:34:48.071+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (474, 1, 'DOCUMENTOS', 'Creación de recurso', 'Creación en Documentos', NULL, NULL, '2026-08-06 20:34:48.071+00', NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria VALUES (476, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:34:48.106+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (475, 1, 'DOCUMENTOS', 'Consulta de recurso', 'Consulta en Documentos #5', 5, NULL, '2026-08-06 20:34:48.106+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (477, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:53:16.052+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (478, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:53:16.052+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (479, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:53:29.778+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (480, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 20:53:29.778+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (482, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:33.437+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (481, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:33.437+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (483, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:38.416+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (484, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:38.416+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (485, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:50.775+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (486, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:50.775+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (487, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:54.333+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (488, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 20:53:54.333+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (489, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:15:50.979+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (490, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:15:50.979+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (491, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:00.654+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (492, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:00.654+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (493, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:22.494+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (494, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:22.494+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (495, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — VERIFICADA', NULL, NULL, '2026-08-06 21:16:22.672+00', NULL, NULL, '{"estado":"VERIFICADA","observaciones":"Se verificó la actualización del procedimiento y la firma del formato. Acciones eficaces, se cierra la NC."}', NULL);
INSERT INTO public.auditoria VALUES (496, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — VERIFICADA', NULL, NULL, '2026-08-06 21:16:22.672+00', NULL, NULL, '{"estado":"VERIFICADA","observaciones":"Se verificó la actualización del procedimiento y la firma del formato. Acciones eficaces, se cierra la NC."}', NULL);
INSERT INTO public.auditoria VALUES (497, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:22.769+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (498, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:22.769+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (499, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — EN_CURSO', NULL, NULL, '2026-08-06 21:16:36.522+00', NULL, NULL, '{"estado":"EN_CURSO","observaciones":"Reapertura de la no conformidad"}', NULL);
INSERT INTO public.auditoria VALUES (500, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — EN_CURSO', NULL, NULL, '2026-08-06 21:16:36.522+00', NULL, NULL, '{"estado":"EN_CURSO","observaciones":"Reapertura de la no conformidad"}', NULL);
INSERT INTO public.auditoria VALUES (501, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:36.618+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (502, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:36.618+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (503, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — CERRADA', NULL, NULL, '2026-08-06 21:16:46.625+00', NULL, NULL, '{"estado":"CERRADA","observaciones":"Cierre formal de la no conformidad"}', NULL);
INSERT INTO public.auditoria VALUES (504, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD — CERRADA', NULL, NULL, '2026-08-06 21:16:46.627+00', NULL, NULL, '{"estado":"CERRADA","observaciones":"Cierre formal de la no conformidad"}', NULL);
INSERT INTO public.auditoria VALUES (505, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:46.71+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (506, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #28', NULL, NULL, '2026-08-06 21:16:46.71+00', NULL, NULL, NULL, 28);
INSERT INTO public.auditoria VALUES (507, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:16:54.912+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (508, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:16:54.912+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (509, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:27:28.71+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (510, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:27:28.71+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (511, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:52:24.524+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (512, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:52:24.524+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (513, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:54:45.015+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (514, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 21:54:45.015+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (515, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 23:52:25.426+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (516, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-06 23:52:25.427+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (517, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:11:13.898+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (518, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:11:13.897+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (519, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:16.235+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (520, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:16.235+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (521, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:42.587+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (524, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:49.952+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (525, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:58.149+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (522, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:42.587+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (523, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:49.949+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (526, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:17:58.149+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (528, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:42:46.044+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (527, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-07 00:42:46.044+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (530, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-11 15:41:20.931+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (529, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-11 15:41:20.93+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (531, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:09:26.954+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (532, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:09:26.954+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (533, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:09:59.111+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (534, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:09:59.111+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (536, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:10:07.191+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (535, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:10:07.191+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (537, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:27:38.386+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (538, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:27:38.386+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (539, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:27:57.913+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (540, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:27:57.913+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (541, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:29:33.299+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (542, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:29:33.299+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (544, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:31:41.06+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (543, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:31:41.06+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (545, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:35:04.763+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (546, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-12 21:35:04.763+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (547, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:27.594+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (548, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:27.594+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (549, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:32.614+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z"}', 1);
INSERT INTO public.auditoria VALUES (550, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:32.614+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z"}', 1);
INSERT INTO public.auditoria VALUES (552, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:37.77+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (551, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:37.77+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (553, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:43.265+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z"}', 1);
INSERT INTO public.auditoria VALUES (554, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:43.265+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z"}', 1);
INSERT INTO public.auditoria VALUES (555, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:46.989+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (556, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:46.991+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (557, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:51.916+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (558, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:19:51.916+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (559, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:25:39.081+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (560, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-13 02:25:39.081+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (562, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-17 15:56:08.626+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (561, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #5', NULL, NULL, '2026-08-17 15:56:08.626+00', NULL, NULL, NULL, 5);
INSERT INTO public.auditoria VALUES (563, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 15:59:29.902+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (564, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 15:59:29.902+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (565, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — RECIBIDA', NULL, NULL, '2026-08-17 15:59:35.961+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z","estado":"RECIBIDA"}', 1);
INSERT INTO public.auditoria VALUES (566, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — RECIBIDA', NULL, NULL, '2026-08-17 15:59:35.962+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z","estado":"RECIBIDA"}', 1);
INSERT INTO public.auditoria VALUES (568, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 15:59:38.676+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (567, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 15:59:38.676+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (569, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — EN_SEGUIMIENTO', NULL, NULL, '2026-08-17 15:59:46.097+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z","estado":"EN_SEGUIMIENTO"}', 1);
INSERT INTO public.auditoria VALUES (570, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #1 — EN_SEGUIMIENTO', NULL, NULL, '2026-08-17 15:59:46.097+00', NULL, NULL, '{"cliente":"Empresa Acme S.A. ACTUALIZADA","telefono_contacto":"555-1234","email_contacto":"test@test.com","formulado_por":"Pedro Lopez","descripcion_queja":"Descripcion actualizada","recibida_por":"Juan P�rez Garc�a","recibida_fecha":"2026-08-12T00:00:00.000Z","estado":"EN_SEGUIMIENTO"}', 1);
INSERT INTO public.auditoria VALUES (571, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:19:35.075+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (572, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:19:35.075+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (573, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:25:16.432+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (574, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:25:16.432+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (576, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:25:31.125+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (575, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 16:25:31.125+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (577, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:14.428+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (578, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:14.428+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (579, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:17.065+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (580, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:17.065+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (581, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:21.266+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (582, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:21.266+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (583, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:23.663+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (584, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:23.663+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (585, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:29.776+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (586, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:29.776+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (587, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:39.673+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (588, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:11:39.673+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (590, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:50:07.358+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (589, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 17:50:07.358+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (592, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:18.743+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (591, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:18.743+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (593, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:57.687+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (594, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:57.687+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (595, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:59.959+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (596, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 18:45:59.96+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (597, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 19:02:43.218+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (598, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #1', NULL, NULL, '2026-08-17 19:02:43.218+00', NULL, NULL, NULL, 1);
INSERT INTO public.auditoria VALUES (600, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:14:36.584+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (599, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:14:36.584+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (601, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #2 — PROCEDENTE', NULL, NULL, '2026-08-17 19:15:36.848+00', NULL, NULL, '{"area_afectada":"GESTION_CALIDAD","procedente":null,"justificativo_no_procede":null,"estado":"PROCEDENTE"}', 2);
INSERT INTO public.auditoria VALUES (602, 1, 'CALIDAD', 'Edición de recurso', 'Edición en CALIDAD #2 — PROCEDENTE', NULL, NULL, '2026-08-17 19:15:36.848+00', NULL, NULL, '{"area_afectada":"GESTION_CALIDAD","procedente":null,"justificativo_no_procede":null,"estado":"PROCEDENTE"}', 2);
INSERT INTO public.auditoria VALUES (603, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:36.887+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (604, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:36.887+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (605, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:41.827+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (606, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:41.827+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (607, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:54.124+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (608, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:15:54.124+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (609, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:23:19.461+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (610, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:23:19.461+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (611, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:25:31.555+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (612, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:25:31.555+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (613, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:25:51.594+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (614, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:25:51.594+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (615, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:00.091+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (616, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:00.091+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (617, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:09.437+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (618, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:09.437+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (619, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:28.728+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (620, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:28.728+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (621, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:51.808+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (622, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:26:51.808+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (623, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:28:41.175+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (624, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:28:41.175+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (625, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:29:05.819+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (626, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-17 19:29:05.819+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (627, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:46.73+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (628, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:46.73+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (629, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:51.762+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (630, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:51.762+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (631, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:54.568+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (632, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:54.568+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (633, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:59.095+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (634, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:49:59.095+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (635, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:50:02.277+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (636, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:50:02.277+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (637, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:50:20.869+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (638, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:50:20.869+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (639, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:51:53.355+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (640, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:51:53.355+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (642, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:51:55.871+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (641, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:51:55.871+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (643, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:52:05.068+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (644, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:52:05.068+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (645, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:52:07.184+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (646, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:52:07.184+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (647, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:53:04.585+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (648, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:53:04.584+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (649, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:53:34.536+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (650, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 00:53:34.536+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (651, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:18:04.756+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (652, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:18:04.756+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (653, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:18:08.738+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (654, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:18:08.738+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (655, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:20:28.508+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (656, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #2', NULL, NULL, '2026-08-18 01:20:28.508+00', NULL, NULL, NULL, 2);
INSERT INTO public.auditoria VALUES (657, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 01:57:53.887+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (658, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 01:57:53.888+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (659, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 02:04:56.567+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (660, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 02:04:56.567+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (661, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 02:05:18.511+00', NULL, NULL, NULL, 3);
INSERT INTO public.auditoria VALUES (662, 1, 'CALIDAD', 'Consulta de recurso', 'Consulta en CALIDAD #3', NULL, NULL, '2026-08-18 02:05:18.511+00', NULL, NULL, NULL, 3);


--
-- Data for Name: auditoria_interna; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.auditoria_interna VALUES (1, 'AI-2026-07', 'INTERNA', 'Prueba', '2026-07-28', '2026-07-28', 1, 'PLANIFICADA', NULL, true, '2026-07-27 15:07:22.693+00', '2026-08-04 18:32:20.414+00', '/uploads/calidad/AI-2026-07/planificaciones/HistorialIESS_SanguchoMarco_1785164842667.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (2, 'PER-001', 'INTERNA', 'sdfsd', '2026-08-14', '2026-08-25', 1, 'PLANIFICADA', NULL, true, '2026-08-04 17:39:10.07+00', '2026-08-04 18:32:20.45+00', '/uploads/calidad/PER-001/planificaciones/SelfTalk-SanguchoMiguel_1785865149928.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (3, 'TEST-UP-01', 'INTERNA', 'prueba', '2026-08-04', NULL, 1, 'PLANIFICADA', NULL, false, '2026-08-04 18:33:59.748+00', '2026-08-04 18:34:05.285+00', '/uploads/calidad/TEST-UP-01/planificaciones/plan_prueba_1785868439742.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (4, '26 000001', 'INTERNA', 'Aplica al sistema de gestión del Dpto. de Calidad y Dpto. Técnico del CMEE.', '2026-08-10', '2026-08-12', 1, 'PLANIFICADA', 'Auditoría de prueba creada con el nuevo programa.', false, '2026-08-06 14:42:16.475+00', '2026-08-06 16:24:17.67+00', NULL, 'Auditoría Interna 2026 del CMEE', 'Determinar si la gestión y las actividades del CMEE están conformes con los requisitos de la Norma NTE INEN ISO/IEC 17025 y con el sistema de gestión de la calidad.', '["Manual de calidad", "Norma NTE INEN ISO/IEC 17025"]', 'director', '[{"nombre": "Miguel Sangucho", "funcion": "Evaluador líder", "seccion": "EVALUADOR_LIDER", "designacion": "EL"}, {"nombre": "", "funcion": "Evaluador de gestión de la calidad", "seccion": "EVALUADOR_CALIDAD", "designacion": "EG"}]', '[{"fecha": "2026-08-10", "actividades": [{"hora": "09:00-09:30", "actividad": "Reunión de apertura y revisión de la planificación", "evaluador": "EL", "referencia": "8.1"}, {"hora": "09:30-11:00", "actividad": "Revisión de la gestión del sistema de calidad", "evaluador": "EG", "referencia": "8.2"}]}, {"fecha": "2026-08-11", "actividades": [{"hora": "09:00-10:30", "actividad": "Auditoría técnica de los laboratorios", "evaluador": "ET1", "referencia": "7.2"}]}]', '[{"test": "1", "muestra": "Cronómetro", "evaluador": "ET1", "metodo_ensayo": "CA7.P1", "metodo_magnitud": "Tiempo y Frecuencia: Intervalo de Tiempo"}, {"test": "2", "muestra": "Balanza", "evaluador": "ET1", "metodo_ensayo": "CA9.P2", "metodo_magnitud": "Masa: Balanza patrón"}]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (5, '26 000002', 'INTERNA', 'Aplica al sistema de gestión del Departamento de Calidad y del Departamento Técnico del CMEE, incluyendo los cuatro laboratorios: Magnitudes Eléctricas, Termometría, Presión y Tiempo y Frecuencia. La auditoría cubre los procesos de recepción, calibración, emisión de certificados, servicio al cliente y gestión documental.', '2026-08-10', '2026-08-14', 1, 'PLANIFICADA', 'Los evaluadores técnicos ET1-ET4 serán acompañados por evaluadores en entrenamiento y observadores. Se coordinará el uso de los patrones de referencia con los responsables técnicos de cada laboratorio. Las NC detectadas se registrarán con su plan de acción y verificación de eficacia.', true, '2026-08-06 16:25:55.257+00', '2026-08-06 16:28:07.492+00', NULL, 'Auditoría Interna Anual 2026', 'Determinar si la gestión y las actividades del CMEE están conformes con los requisitos de la Norma NTE INEN ISO/IEC 17025:2018, de la Norma ISO 19011:2018 y de la Norma ISO 9001:2015, así como verificar la eficacia del sistema de gestión de la calidad implementado.', '["Manual de Calidad del CMEE", "Norma NTE INEN ISO/IEC 17025:2018", "Norma ISO 19011:2018", "Norma ISO 9001:2015", "Procedimientos del sistema de gestión GD4"]', 'director', '[{"nombre": "Carlos Andrés Mena Zambrano", "funcion": "Evaluador líder", "seccion": "EVALUADOR_LIDER", "designacion": "EL"}, {"nombre": "Patricia Alexandra Salazar Cobo", "funcion": "Evaluador de gestión de la calidad", "seccion": "EVALUADOR_CALIDAD", "designacion": "EG"}, {"nombre": "Diego Armando Paredes Núñez", "funcion": "Laboratorio de Magnitudes Eléctricas", "seccion": "EVALUADOR_TECNICO", "designacion": "ET1"}, {"nombre": "Katherine Lisbeth Ramos Vera", "funcion": "Laboratorio de Termometría", "seccion": "EVALUADOR_TECNICO", "designacion": "ET2"}, {"nombre": "Andrea Carolina Vásquez Molina", "funcion": "Laboratorio de Presión", "seccion": "EVALUADOR_TECNICO", "designacion": "ET3"}, {"nombre": "Ricardo Javier Bravo Cifuentes", "funcion": "Laboratorio Nacional Designado de Tiempo y Frecuencia", "seccion": "EVALUADOR_TECNICO", "designacion": "ET4"}, {"nombre": "Bryan Santiago Quintero León", "funcion": "Laboratorio de Magnitudes Eléctricas", "seccion": "EVALUADOR_ENTRENAMIENTO", "designacion": "EE"}, {"nombre": "Daniela Cristina Hurtado Vega", "funcion": "Laboratorio de Termometría", "seccion": "OBSERVADOR", "designacion": "OBS"}]', '[{"fecha": "2026-08-10", "actividades": [{"hora": "08:30-09:00", "actividad": "Reunión de apertura", "evaluador": "EL", "referencia": "ISO 19011 §6.7.5"}, {"hora": "09:00-12:00", "actividad": "Revisión documental del sistema de gestión", "evaluador": "EL, EG", "referencia": "ISO 17025 §8.3"}, {"hora": "14:00-17:00", "actividad": "Auditoría del Departamento de Calidad", "evaluador": "EL, EG", "referencia": "ISO 17025 §8.6, §8.7"}]}, {"fecha": "2026-08-11", "actividades": [{"hora": "08:30-12:00", "actividad": "Auditoría del Laboratorio de Magnitudes Eléctricas", "evaluador": "ET1", "referencia": "ISO 17025 §6.4, §6.5"}, {"hora": "14:00-16:00", "actividad": "Testificación: calibración de multímetro", "evaluador": "ET1", "referencia": "ISO 17025 §7.2"}]}, {"fecha": "2026-08-12", "actividades": [{"hora": "08:30-12:00", "actividad": "Auditoría del Laboratorio de Termometría", "evaluador": "ET2", "referencia": "ISO 17025 §6.4, §6.5"}, {"hora": "14:00-16:00", "actividad": "Auditoría del Laboratorio de Presión", "evaluador": "ET3", "referencia": "ISO 17025 §6.4, §7.6"}]}, {"fecha": "2026-08-13", "actividades": [{"hora": "08:30-12:00", "actividad": "Auditoría del Laboratorio Nacional de Tiempo y Frecuencia", "evaluador": "ET4", "referencia": "ISO 17025 §7.6.3"}, {"hora": "14:00-16:00", "actividad": "Testificación: medición de intervalo de tiempo", "evaluador": "ET4", "referencia": "ISO 17025 §7.2"}]}, {"fecha": "2026-08-14", "actividades": [{"hora": "08:30-11:00", "actividad": "Revisión de hallazgos y preparación del informe", "evaluador": "EL", "referencia": "ISO 19011 §6.8"}, {"hora": "11:30-12:30", "actividad": "Reunión de cierre", "evaluador": "EL", "referencia": "ISO 19011 §6.7.7"}]}]', '[{"test": "1", "muestra": "Cronómetro digital", "evaluador": "ET4", "metodo_ensayo": "CA7.P1", "metodo_magnitud": "Tiempo y Frecuencia: Intervalo de Tiempo"}, {"test": "2", "muestra": "Multímetro digital", "evaluador": "ET1", "metodo_ensayo": "CA4.P2", "metodo_magnitud": "Magnitudes Eléctricas: Tensión continua"}, {"test": "3", "muestra": "Termómetro de referencia", "evaluador": "ET2", "metodo_ensayo": "CA2.P1", "metodo_magnitud": "Termometría: Temperatura"}, {"test": "4", "muestra": "Manómetro digital", "evaluador": "ET3", "metodo_ensayo": "CA3.P2", "metodo_magnitud": "Presión: Presión manométrica"}]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (7, '26 000003', 'EXTERNA', NULL, '2026-08-10', '2026-08-11', NULL, 'EN_CURSO', NULL, false, '2026-08-07 00:26:59.25+00', '2026-08-07 00:27:40.113+00', NULL, NULL, NULL, '["Norma de Acreditacion", "Ley del Sistema Ecuatoriano de Calidad"]', NULL, '[{"rol": "Evaluador L�der", "nombre": "Israel Carrion", "alcance": "Documentaci�n Sistema de gesti�n ISO/IEC 17025"}]', '[{"fecha": "2026-08-10", "actividades": [{"hora": "08:30-08:50", "actividad": "Reuni�n de Apertura", "evaluador": "EL", "referencia": "NA"}]}]', '[{"test": "1", "muestra": "Mult�metro digital", "evaluador": "BA", "metodo_ensayo": "CA4.P1", "metodo_magnitud": "Voltaje corriente continua"}]', 'Agrupamiento de Comunicaciones y Guerra Electr�nica de la FT', 'OAE LC-08-004', 'Laboratorio de Calibraci�n', 'Mayor Garz�n Mu�oz Marcelo Javier', 'NTE INEN-ISO/IEC 17025:2018', 'Vigilancia N� 2 (Remota) - actualizado', 'ESPA�OL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (8, '26 000004', 'INTERNA', 'Aplica al sistema de gesti�n del Dpto. de Calidad y Dpto. T�cnico del CMEE', '2026-08-10', NULL, 1, 'PLANIFICADA', NULL, false, '2026-08-07 00:27:31.581+00', '2026-08-07 00:27:40.15+00', NULL, 'Auditor�a interna 2026', 'Verificar conformidad con ISO 17025', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (9, '26 000005', 'EXTERNA', 'Alcance de evaluaci�n: competencia t�cnica de laboratorio de calibraci�n conforme a NTE INEN-ISO/IEC 17025:2018', '2026-08-10', NULL, NULL, 'PLANIFICADA', NULL, false, '2026-08-07 00:45:59.82+00', '2026-08-07 00:45:59.942+00', NULL, NULL, NULL, '["Norma de Acreditacion"]', NULL, '[{"rol": "Evaluador L�der", "nombre": "Test", "alcance": "Documentaci�n"}]', '[]', '[]', 'OEC de prueba', 'OAE TEST-001', 'Laboratorio de Calibraci�n', 'Contacto Test', 'NTE INEN-ISO/IEC 17025:2018', 'Vigilancia N� 1', 'ESPA�OL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.auditoria_interna VALUES (11, '26 000007', 'EXTERNA', NULL, '2026-09-01', NULL, NULL, 'PLANIFICADA', NULL, false, '2026-08-07 01:36:50.21+00', '2026-08-07 01:37:03.883+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Laboratorio de Ensayos y Calibraciones', NULL, NULL, 'May. Garzón Muñoz Marcelo Javier', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Re-evaluación","Vigilancia N° 3"]', NULL, NULL, NULL, NULL, 'Israel Carrión');
INSERT INTO public.auditoria_interna VALUES (10, '26 000006', 'EXTERNA', 'Ensayo y calibraci�n', '2026-08-20', NULL, NULL, 'PLANIFICADA', NULL, false, '2026-08-07 01:36:08.685+00', '2026-08-07 01:37:03.832+00', NULL, NULL, NULL, '["Norma de Acreditaci�n descrita en el alcance de evaluaci�n (numeral 1)", "Solicitud de Acreditaci�n"]', NULL, '[{"rol": "Evaluador L�der", "email": "nl@sa.gob", "nombre": "Nuevo L�der", "alcance": "17025", "entidad": "SAE", "telefono": "0991", "modalidad": "REMOTO"}]', '[{"fecha": "2026-08-20", "actividades": [{"hora": "09:00", "actividad": "Apertura", "evaluador": "EL", "referencia": "8.1"}]}]', '[{"test": "1", "muestra": "Cron�metro", "evaluador": "ET1", "metodo_ensayo": "CA7.P1", "metodo_magnitud": "Intervalo de Tiempo"}]', 'Laboratorio de Ensayos y Calibraciones (LABCAL)', 'OAE LC-08-004', 'Laboratorio de Calibraci�n', 'May. Garz�n Mu�oz Marcelo Javier', 'NTE INEN-ISO/IEC 17025:2018', 'Remota, Testificaci�n', 'ESPA�OL', 'cmte_cmee@crmee.mil.ec', 'Quito, Ecuador', '2414432; EXT 105/102', 'Av. Los Pinos N7-105, FUERTE MILITAR RUMI�AHUI', 'N/A', '["Re-evaluaci�n","Vigilancia N� 3"]', '2021-07-22 y 23', 'N/A', 'OFICINA MATRIZ - REMOTO', '2026-08-15', 'Daniel Ortiz');


--
-- Data for Name: auditoria_historial; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: laboratorio; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.laboratorio VALUES (2, 'LAB-TER', 'Laboratorio de Termometría', NULL, true, NULL, '2026-08-06 14:52:18.829+00', '2026-08-06 14:52:18.829+00');
INSERT INTO public.laboratorio VALUES (3, 'LAB-PRE', 'Laboratorio de Presión', NULL, true, NULL, '2026-08-06 14:52:18.838+00', '2026-08-06 14:52:18.838+00');
INSERT INTO public.laboratorio VALUES (4, 'LAB-TYF', 'Laboratorio Nacional Designado de Tiempo y Frecuencia', NULL, true, NULL, '2026-08-06 14:52:18.846+00', '2026-08-06 14:52:18.846+00');
INSERT INTO public.laboratorio VALUES (1, 'LAB-ELE', 'Laboratorio de Magnitudes Eléctricas', NULL, true, NULL, '2026-08-06 14:52:18.806+00', '2026-08-06 20:15:53.498+00');


--
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.departamento VALUES (2, 'dir', 'Dirección del Centro de Metrología', 'Departamento', NULL, NULL, NULL, 0, true, '2026-08-06 14:52:18.858+00', '2026-08-06 14:52:18.858+00', NULL);
INSERT INTO public.departamento VALUES (1, 'cd', 'Departamento de Calidad', 'Departamento', '', 2, 1, 1, true, '2026-07-28 15:01:01.589+00', '2026-08-06 14:52:18.880342+00', NULL);
INSERT INTO public.departamento VALUES (4, 'dt', 'Departamento Técnico', 'Departamento', NULL, 2, NULL, 2, true, '2026-08-06 14:52:18.919+00', '2026-08-06 14:52:18.919+00', NULL);
INSERT INTO public.departamento VALUES (5, 'da', 'Departamento Administrativo', 'Departamento', NULL, 2, NULL, 3, true, '2026-08-06 14:52:18.923+00', '2026-08-06 14:52:18.923+00', NULL);
INSERT INTO public.departamento VALUES (6, 'scm', 'Servicio al Cliente / Marketing', 'Grupo de trabajo', NULL, 2, NULL, 4, true, '2026-08-06 14:52:18.928+00', '2026-08-06 14:52:18.928+00', NULL);
INSERT INTO public.departamento VALUES (7, 'lab-me', 'Laboratorio de Magnitudes Eléctricas', 'Grupo de trabajo', NULL, 4, NULL, 0, true, '2026-08-06 14:52:18.931+00', '2026-08-06 14:52:18.931+00', 1);
INSERT INTO public.departamento VALUES (8, 'lab-ter', 'Laboratorio de Termometría', 'Grupo de trabajo', NULL, 4, NULL, 1, true, '2026-08-06 14:52:18.935+00', '2026-08-06 14:52:18.935+00', 2);
INSERT INTO public.departamento VALUES (9, 'lab-pre', 'Laboratorio de Presión', 'Grupo de trabajo', NULL, 4, NULL, 2, true, '2026-08-06 14:52:18.938+00', '2026-08-06 14:52:18.938+00', 3);
INSERT INTO public.departamento VALUES (10, 'lab-tyf', 'Laboratorio Nacional Designado de Tiempo y Frecuencia', 'Grupo de trabajo', NULL, 4, NULL, 3, true, '2026-08-06 14:52:18.94+00', '2026-08-06 14:52:18.94+00', 4);


--
-- Data for Name: carpetas_permisos; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.carpetas_permisos VALUES (1, 1, NULL, 5, true, true, true, 1);
INSERT INTO public.carpetas_permisos VALUES (2, 2, NULL, 5, true, true, true, 1);
INSERT INTO public.carpetas_permisos VALUES (3, 3, NULL, 5, true, true, true, 1);


--
-- Data for Name: clientes_institucionales; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: ordenes_trabajo; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: equipos_recepcion; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: certificado; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: configuracion_general; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.configuracion_general VALUES (1, 'Centro de Metrología del Ejército Ecuatoriano', 5, '2026-07-28 14:53:15.355503+00');


--
-- Data for Name: documento_persona; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: documentos_relaciones; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: documentos_versiones; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.documentos_versiones VALUES (2, 2, '1', 'uploads/Gestor_Documental/externo/pele/interno/RCR1785208226630581.pdf', 'Miguel Sangucho', NULL, '2026-07-28 15:06:02.63');
INSERT INTO public.documentos_versiones VALUES (4, 4, '1', 'uploads/Gestor_Documental/externo/pele/interno/GD2.1.P1_GESTION_DE_DOCUMENTOS.pdf', 'Miguel Sangucho', NULL, '2026-08-05 20:40:38.809');
INSERT INTO public.documentos_versiones VALUES (5, 5, '1', 'uploads/Gestor_Documental/externo/pele/interno/ActaFiniquito.pdf', 'Miguel Sangucho', NULL, '2026-08-06 20:31:11.273');


--
-- Data for Name: documentos_workflow; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.documentos_workflow VALUES (1, 2, 1, 'EN_CURSO', '2026-07-28 15:06:02.636', '2026-07-28 15:06:02.636');
INSERT INTO public.documentos_workflow VALUES (2, 4, 1, 'EN_CURSO', '2026-08-05 20:40:38.818', '2026-08-05 20:40:38.818');
INSERT INTO public.documentos_workflow VALUES (3, 5, 1, 'COMPLETADO', '2026-08-06 20:31:11.286', '2026-08-06 20:34:48.057');


--
-- Data for Name: fases; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.fases VALUES (1, 1, 'ELABORCION', 10, '', '', false, true, false, true, false, false);
INSERT INTO public.fases VALUES (2, 1, 'APROBACION', 10, '', '', false, true, false, true, false, false);


--
-- Data for Name: documentos_workflow_fases; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.documentos_workflow_fases VALUES (1, 1, 1, 'EN_CURSO', NULL, NULL, NULL, '2026-07-28 15:06:02.636', '2026-07-28 15:06:02.636');
INSERT INTO public.documentos_workflow_fases VALUES (2, 1, 2, 'PENDIENTE', NULL, NULL, NULL, '2026-07-28 15:06:02.636', '2026-07-28 15:06:02.636');
INSERT INTO public.documentos_workflow_fases VALUES (3, 2, 1, 'COMPLETADO', 'uploads/Gestor_Documental/externo/pele/interno/firma_3_documento_firmado.pdf', 'YUGCHA CHANGOLUISA CRISTIAN EFRAIN', NULL, '2026-08-05 20:40:38.818', '2026-08-05 20:49:51.703');
INSERT INTO public.documentos_workflow_fases VALUES (4, 2, 2, 'EN_CURSO', NULL, NULL, NULL, '2026-08-05 20:40:38.818', '2026-08-05 20:49:51.722');
INSERT INTO public.documentos_workflow_fases VALUES (5, 3, 1, 'COMPLETADO', 'uploads/Gestor_Documental/externo/pele/interno/firma_5_documento_firmado.pdf', 'KATERIN TATIANA HEREDIA TAPIA', NULL, '2026-08-06 20:31:11.286', '2026-08-06 20:32:44.398');
INSERT INTO public.documentos_workflow_fases VALUES (6, 3, 2, 'COMPLETADO', 'uploads/Gestor_Documental/externo/pele/interno/firma_6_documento_firmado.pdf', 'KATERIN TATIANA HEREDIA TAPIA', NULL, '2026-08-06 20:31:11.286', '2026-08-06 20:34:48.045');


--
-- Data for Name: equipo; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: fases_participantes; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.fases_participantes VALUES (1, 1, 1);
INSERT INTO public.fases_participantes VALUES (2, 2, 1);


--
-- Data for Name: firma_digital; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: firma_documento_fase; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.firma_documento_fase VALUES (1, 3, 1, 'YUGCHA CHANGOLUISA CRISTIAN EFRAIN', 'AUTORIDAD DE CERTIFICACION SUBCA-1EF CORPNEWBEST', '1526e24077e5cb80e961', '2025-08-19 21:05:47', '2027-08-19 21:05:46', 'b1e845fb71030943eab385811dc7c1aedba89bd26c87760cacefe8fb5bb9a30b', '2026-08-05 20:49:51.708', '2026-08-05 20:49:51.708+00');
INSERT INTO public.firma_documento_fase VALUES (2, 5, 1, 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', 'e9560501e70d8cb468b650e4e5b40ec978724f6237a6a2955111f275fbe4ebb2', '2026-08-06 20:32:44.402', '2026-08-06 20:32:44.402+00');
INSERT INTO public.firma_documento_fase VALUES (3, 6, 1, 'KATERIN TATIANA HEREDIA TAPIA', 'UANATACA CA2 2016', '741612a82a092189', '2025-10-15 21:42:00', '2027-10-15 21:42:00', '60bb07d1f7a658a0d18276e19fc1ffad95e06bd6b996f76bf9128376a38181ab', '2026-08-06 20:34:48.051', '2026-08-06 20:34:48.051+00');


--
-- Data for Name: grupo_aplicacion; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.grupo_aplicacion VALUES (8, 1, 7, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (9, 1, 2, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (10, 1, 1, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (11, 1, 3, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (12, 1, 4, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (13, 1, 6, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');
INSERT INTO public.grupo_aplicacion VALUES (14, 1, 5, 5, 0, '2026-07-27 15:06:37.574+00', '2026-07-27 15:06:37.574+00');


--
-- Data for Name: historial_estado; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: intento_login; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.intento_login VALUES (1, 'ms', true, NULL, '::1', 1, '2026-07-28 15:01:28.706+00');
INSERT INTO public.intento_login VALUES (2, 'ms', true, NULL, '::1', 1, '2026-07-29 16:55:37.454+00');
INSERT INTO public.intento_login VALUES (3, 'ms', true, NULL, '::1', 1, '2026-08-04 15:22:16.559+00');
INSERT INTO public.intento_login VALUES (4, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 17:43:56.311+00');
INSERT INTO public.intento_login VALUES (5, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 17:44:54.052+00');
INSERT INTO public.intento_login VALUES (6, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 17:45:50.465+00');
INSERT INTO public.intento_login VALUES (7, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 17:46:13.259+00');
INSERT INTO public.intento_login VALUES (8, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 17:46:28.279+00');
INSERT INTO public.intento_login VALUES (9, 'ms', true, NULL, '::1', 1, '2026-08-04 18:19:43.132+00');
INSERT INTO public.intento_login VALUES (10, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:33:36.864+00');
INSERT INTO public.intento_login VALUES (11, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:33:43.605+00');
INSERT INTO public.intento_login VALUES (12, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:33:48.649+00');
INSERT INTO public.intento_login VALUES (13, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:33:53.133+00');
INSERT INTO public.intento_login VALUES (14, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:33:59.695+00');
INSERT INTO public.intento_login VALUES (15, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:34:05.251+00');
INSERT INTO public.intento_login VALUES (16, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:57:05.33+00');
INSERT INTO public.intento_login VALUES (17, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:57:15.144+00');
INSERT INTO public.intento_login VALUES (18, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 18:57:23.195+00');
INSERT INTO public.intento_login VALUES (19, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:02:06.387+00');
INSERT INTO public.intento_login VALUES (20, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:02:21.219+00');
INSERT INTO public.intento_login VALUES (21, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:02:26.933+00');
INSERT INTO public.intento_login VALUES (22, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:02:37.323+00');
INSERT INTO public.intento_login VALUES (23, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:02:50.088+00');
INSERT INTO public.intento_login VALUES (24, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:03:24.539+00');
INSERT INTO public.intento_login VALUES (25, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:03:32.249+00');
INSERT INTO public.intento_login VALUES (26, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:04:29.553+00');
INSERT INTO public.intento_login VALUES (27, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:23:37.527+00');
INSERT INTO public.intento_login VALUES (28, 'admin_root', true, NULL, '::1', NULL, '2026-08-04 19:23:53.802+00');
INSERT INTO public.intento_login VALUES (29, 'ms', true, NULL, '::1', 1, '2026-08-05 14:56:34.206+00');
INSERT INTO public.intento_login VALUES (30, 'ms', true, NULL, '::1', 1, '2026-08-06 01:03:01.322+00');
INSERT INTO public.intento_login VALUES (31, 'ms', true, NULL, '::1', 1, '2026-08-06 12:26:21.217+00');
INSERT INTO public.intento_login VALUES (32, 'ms', true, NULL, '::1', 1, '2026-08-06 20:27:07.283+00');
INSERT INTO public.intento_login VALUES (33, 'ms', false, 'clave_incorrecta', '::1', 1, '2026-08-07 00:25:46.093+00');
INSERT INTO public.intento_login VALUES (34, 'ms', false, 'clave_incorrecta', '::1', 1, '2026-08-07 00:25:46.24+00');
INSERT INTO public.intento_login VALUES (35, 'ms', false, 'clave_incorrecta', '::1', 1, '2026-08-07 00:25:46.366+00');
INSERT INTO public.intento_login VALUES (36, 'admin_root', true, NULL, '::1', NULL, '2026-08-07 00:26:48.311+00');
INSERT INTO public.intento_login VALUES (37, 'ms', true, NULL, '::1', 1, '2026-08-11 15:41:18.546+00');
INSERT INTO public.intento_login VALUES (38, 'ms', true, NULL, '::1', 1, '2026-08-11 17:26:03.397+00');
INSERT INTO public.intento_login VALUES (39, 'admin_root', true, NULL, '::1', NULL, '2026-08-12 17:19:31.827+00');
INSERT INTO public.intento_login VALUES (40, 'ms', true, NULL, '::1', 1, '2026-08-12 17:21:00.315+00');
INSERT INTO public.intento_login VALUES (41, 'ms', true, NULL, '::1', 1, '2026-08-13 02:19:23.548+00');
INSERT INTO public.intento_login VALUES (42, 'admin_root', true, NULL, '::1', NULL, '2026-08-13 03:37:44.223+00');
INSERT INTO public.intento_login VALUES (43, 'ms', true, NULL, '::1', 1, '2026-08-17 15:55:57.429+00');
INSERT INTO public.intento_login VALUES (44, 'ms', true, NULL, '::1', 1, '2026-08-17 18:55:20.671+00');
INSERT INTO public.intento_login VALUES (45, 'admin_root', true, NULL, '::1', NULL, '2026-08-17 19:09:41.042+00');
INSERT INTO public.intento_login VALUES (46, 'admin_root', true, NULL, '::1', NULL, '2026-08-17 19:14:02.392+00');
INSERT INTO public.intento_login VALUES (47, 'ms', true, NULL, '::1', 1, '2026-08-18 00:49:41.778+00');
INSERT INTO public.intento_login VALUES (48, 'admin_root', true, NULL, '::1', NULL, '2026-08-18 01:51:41.139+00');
INSERT INTO public.intento_login VALUES (49, 'admin_root', true, NULL, '::1', NULL, '2026-08-18 01:51:53.297+00');
INSERT INTO public.intento_login VALUES (50, 'admin_root', true, NULL, '::1', NULL, '2026-08-18 01:52:06.607+00');
INSERT INTO public.intento_login VALUES (51, 'admin_root', true, NULL, '::1', NULL, '2026-08-18 01:53:03.564+00');


--
-- Data for Name: no_conformidad; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.no_conformidad VALUES (3, '2', 1, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-08-04 17:00:52.127+00', '2026-08-04 17:17:41.809+00', false, 'No hay relación de los resultados de la evaluación psicológica del Jefe de Calidad (JDC) respecto a los requisitos establecidos en el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2. 

En la Matriz de evaluación. GT1.P2 no se incluye el seguimiento de las habilidades. 
', 'El laboratorio no conserva todos los registros para autorizar al personal y realizar el seguimiento a su competencia o presenta deficiencias ', false, 'NTE INEN ISO/IEC 17025 2018, requisito 7.7.1', 'NC', '{"obCausa": "", "causaRaiz": "<p>El laboratorio, a pesar de contar con un mecanismo sistemático para la validación y seguimiento de las habilidades del personal, presenta una ligera ausencia de un control adecuado, lo que limita la capacidad del laboratorio para garantizar que su personal cumpla con los criterios de competencia requeridos, especialmente en función de los resultados obtenidos en la evaluación psicológica aplicada para el seguimiento y fortalecimiento de habilidades.</p>", "obExtension": "", "correcciones": [{"ob": "", "fecha": "", "evidencia": "", "correccion": "", "observaciones": ""}], "analisisCausa": "<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha implementado una sistemática clara que relacione los requisitos del macroproceso con los registros de talento humano?</strong></p><p>Porque no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades dentro del sistema de gestión.</p><p><strong>&nbsp;</strong></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se ha definido de forma clara la trazabilidad para la evaluación psicológica y el seguimiento de habilidades?</strong></p><p>Porque se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo de sus habilidades.</p><p>&nbsp;</p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué se ha asumido que la evaluación inicial del personal es suficiente y no se ha considerado necesario establecer un seguimiento continuo?</strong></p><p>Porque no se consideró que la omisión del seguimiento pudiera tener un impacto significativo en la confiabilidad del personal para ejecutar actividades del laboratorio.</p>", "analisisExtension": "<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seguimiento a la competencia del personal</strong></p><p>La no conformidad identificada corresponde a la falta de registros de calificación y habilidades del responsable de calidad, obtenidas mediante una evaluación psicológica de sus capacidades de razonamiento abstracto, verbal y numérico. Se revisó la documentación relacionada con la gestión de talento humano, específicamente el MACROPROCESO: GESTIÓN DE TALENTO HUMANO CÓDIGO: GT1.P2, donde se identificó que no se incluyen registros detallados sobre el seguimiento de habilidades del personal técnico y de calidad.</p><p>&nbsp;</p><p>Se observó que, si bien se cuenta con una evaluación psicológica vigente, no existe un registro claro que relacione los resultados de dicha evaluación con los requisitos establecidos en el macroproceso GT1.P2, lo que impide evaluar de manera objetiva y sistemática su cumplimiento. Esta falta de vinculación debilita la toma de decisiones basada en competencias reales y actualizadas del personal involucrado.</p><p>&nbsp;</p><p>Se realizó una revisión detallada de los registros de seguimiento a la competencia del personal en la matriz de evaluación GT1.P2, y se evidenció que no se contempla un mecanismo específico de seguimiento a las habilidades del personal, lo que genera un vacío significativo en la trazabilidad del desarrollo de competencias a lo largo del tiempo.</p><p><strong>2.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Conclusión:</strong></p><p>Luego del análisis realizado, se determinó que la omisión del seguimiento de habilidades en la matriz GT1.P2 genera un incumplimiento dentro del sistema de gestión de calidad del laboratorio. Es necesario actualizar la documentación correspondiente y los registros asociados para garantizar la trazabilidad, el cumplimiento normativo y la mejora continua en la evaluación del desempeño del personal técnico y de calidadd.</p><p><strong>&nbsp;</strong></p>", "accionesCorrectivas": [{"ob": "", "fecha": "", "accion": "", "evidencia": "", "observaciones": ""}]}', NULL, NULL);
INSERT INTO public.no_conformidad VALUES (1, '1', 1, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-07-28 16:44:04.647+00', '2026-07-28 17:22:27.962+00', false, '1)	En el apartado 5.4.6 “Criterio de aceptación o rechazo de la calibración” del procedimiento CA5.P1 Versión 3.0 para la calibración de medidores de presión, se establece que la aceptación de la calibración se basa en las mediciones obtenidas en la prueba de repetibilidad, evaluando los resultados mediante el error normalizado. Sin embargo, el uso de esta herramienta estadística no es adecuado en este contexto ya que el error normalizado se aplica cuando los datos son independientes y se encuentran bajo condiciones de reproducibilidad. Esta misma situación se presenta en el apartado 5.4 del procedimiento, CA6.P8 Versión 2.0 para la calibración de termómetros bimetálicos. Lo mismo se puede evidenciar en magnitudes eléctricas.

2)	El laboratorio no cuenta con un plan que incluye actividades de aseguramiento de la validez de los resultados, más que la comprobación intermedia de los equipos patrones.

3)	No se evidencia que en las actividades de aseguramiento de la validez de los resultados asociados a la calibración se registren de tal forma que las tendencias sean detectables.', 'El laboratorio no ha aplicado técnicas estadísticas adecuadas para la revisión de los resultados, ni se ha planificado las actividades de seguimiento para el aseguramiento de la validez de los ', false, 'NC	01	NTE INEN ISO/IEC 17025 2018, requisito 5.5 b', 'NC', NULL, NULL, NULL);
INSERT INTO public.no_conformidad VALUES (23, '1', 2, NULL, NULL, 'MENOR', NULL, NULL, 'ABIERTA', NULL, NULL, true, '2026-08-04 18:16:44.232+00', '2026-08-04 18:57:46.968+00', false, 'El laboratorio dispone el formato SEGUIMIENTO PARA DETERMINAR SI EXISTE NC SIMILARES F-MC2101-1, sin embargo, no se ha gestionado en este formato las no conformidades de la evaluación del SAE del año 2023 ni las de la Auditoría Interna del 2024.', 'El laboratorio no se asegura de que cuando ocurra una no conformidad se determina la existencia de no conformidades similares.', false, 'NC	01	NTE INEN ISO/IEC 17025 2018, requisito 5.5 b', 'NC', '{"archivo": "/uploads/calidad/PER-001/PlanDeAccion/Matriz_Calidad_Datos_Instacart_Grupo_2_ESPE_APA7_Vertical_1785867562102.docx", "obCausa": "", "causaRaiz": "<p>El laboratorio no ha implementado una sistemática efectiva que garantice la evaluación oportuna de no conformidades similares, ante hechos fortuitos, como en el caso de ausencia prolongada del responsable de gestión de calidad.</p><p><br></p>", "obExtension": "", "correcciones": [{"ob": "", "fecha": "2026-08-18", "evidencia": "Formato de seguimiento F-MC2101-1 debidamente llenado, firmado y revisado por el responsable técnico designado.", "correccion": "Completar el formato de seguimiento para determinar si existen no conformidades similares (F-MC2101-1).", "observaciones": ""}], "analisisCausa": "<p><strong>1)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no se gestionaron las no conformidades de la evaluación del SAE de 2023 y las de la Auditoría Interna de 2024 en el formato de seguimiento F-MC2101-1?</strong></p><p> Porque el encargado de gestión de calidad estuvo delicado de salud, no delegó sus funciones ni responsabilidades, y no se estableció un mecanismo alternativo para garantizar la continuidad del proceso.</p><p><br></p><p><strong>2)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué no delegó sus funciones y responsabilidades, garantizando la continuidad del proceso?</strong></p><p>Porque el encargado de gestión de calidad asumió que podría realizar el análisis dentro del plazo de 180 días establecido en el procedimiento de auditoría.</p><p><br></p><p><strong>3)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué pensó que podría realizar el análisis dentro de los 180 días, a pesar de no estar disponible?</strong></p><p>Porque ante el imprevisto de su ausencia prolongada no considero que disminuiría su capacidad para cumplir con la tarea a tiempo, ni la necesidad de delegar sus funciones y responsabilidades.</p><p><br></p><p><strong>4)&nbsp;&nbsp;&nbsp;&nbsp;¿Por qué ante el imprevisto no delego sus funciones y responsabilidades?</strong></p><p>Porque no se había designado previamente un subrogante que pudiera asumir sus funciones, en caso de una ausencia prolongada o emergencia médica imprevista.</p><p><br></p>", "archivo_nombre": "Matriz_Calidad_Datos_Instacart_Grupo_2_ESPE_APA7_Vertical.docx", "analisisExtension": "<p><strong>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Gestión de no conformidades similares</strong></p><p>Debido a que el encargado del Sistema de Gestión (SG) se encontraba delicado de salud, no delegó su cargo ni sus funciones, situación que pretende regularizar durante el periodo de cierre y seguimiento de 180 días. Esto evidencia la necesidad de contar con un reemplazo disponible para cubrir funciones en ausencia del principal, en caso de una ausencia prolongada o imprevista.</p><p>&nbsp;</p><p>Luego de la revisión, el CMEE se enfoca en analizar una muestra de las No Conformidades (NC) detectadas durante la auditoría de seguimiento 2023 y la auditoría interna 2024, con la finalidad de identificar la existencia de NC similares, tomar acciones correctivas pertinentes o continuar con el calendario establecido. Un ejemplo concreto de lo mencionado es el siguiente:</p><p><br></p>", "accionesCorrectivas": [{"ob": "no", "fecha": "2026-08-19", "accion": "Designar al subrogante que sustituirá al encargado de calidad en caso de ausencia prolongada o imprevista.", "evidencia": "Memorándum de designación. ", "observaciones": "sin observaciones"}, {"ob": "no", "fecha": "2026-08-17", "accion": "Designar al subrogante que sustituirá al encargado de calidad en caso de ausencia prolongada o imprevista.", "evidencia": "Programa de capacitación.", "observaciones": "sin observaciones"}]}', '/uploads/calidad/noconformidades/2026/agosto/NC-3-04082026.pdf', NULL);
INSERT INTO public.no_conformidad VALUES (28, '1', 5, NULL, NULL, 'MENOR', NULL, NULL, 'CERRADA', NULL, '2026-08-06', true, '2026-08-06 16:42:57.864+00', '2026-08-06 21:16:46.589+00', true, 'Revisión del archivo de calidad: no se encontró registro de verificación firmado para las acciones del plan.', 'La evidencia de la verificación de eficacia de acciones correctivas previas no consta en el expediente de la NC asociada.', false, 'ISO/IEC 17025:2017, sección 8.6.2', 'NC', '{"obCausa": "Análisis con el responsable del proceso.", "causaRaiz": "Ausencia de control documentado del cierre de NC en el sistema de gestión.", "obExtension": "Se revisó el histórico de NC del semestre.", "correcciones": [{"ob": "", "fecha": "2026-08-10", "evidencia": "Formato GD4.1.F2 firmado.", "correccion": "Recuperar y firmar la verificación pendiente.", "observaciones": ""}], "analisisCausa": "Falta de un procedimiento que exija registrar la verificación de eficacia.", "analisisExtension": "Se revisó si existían otras NC con causas similares.", "accionesCorrectivas": [{"ob": "", "fecha": "2026-08-20", "accion": "Actualizar el procedimiento de NC para exigir verificación de eficacia por el Director.", "evidencia": "Procedimiento GD4.1 actualizado a rev.2.", "observaciones": ""}]}', NULL, '{"fecha": "2026-09-01", "resultado": "EFICAZ", "aprobado_por": "Miguel Sangucho", "observaciones": "Se verificó la actualización del procedimiento y la firma del formato. Acciones eficaces, se cierra la NC.", "aprobado_por_id": 1}');


--
-- Data for Name: no_conformidad_historial; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.no_conformidad_historial VALUES (5, 28, 'EN_CURSO', 'VERIFICADA', 'ESTADO', 'Se verificó la actualización del procedimiento y la firma del formato. Acciones eficaces, se cierra la NC.', 1, '2026-08-06 21:16:22.595+00');
INSERT INTO public.no_conformidad_historial VALUES (6, 28, 'VERIFICADA', 'EN_CURSO', 'ESTADO', 'Reapertura de la no conformidad', 1, '2026-08-06 21:16:36.507+00');
INSERT INTO public.no_conformidad_historial VALUES (7, 28, 'EN_CURSO', 'CERRADA', 'ESTADO', 'Cierre formal de la no conformidad', 1, '2026-08-06 21:16:46.595+00');


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.notificaciones VALUES (1, 1, 'workflow_avance', 'Revisión pendiente: "GD2.1.P1_GESTION_DE_DOCUMENTOS"', true, 4, '2026-08-05 20:49:51.732+00');
INSERT INTO public.notificaciones VALUES (2, 1, 'workflow_avance', 'Revisión pendiente: "ActaFiniquito"', false, 5, '2026-08-06 20:32:44.418+00');


--
-- Data for Name: persona_puesto; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.persona_puesto VALUES (2, 2, 2, 2, 1, '2026-08-06', true, '2026-08-06 16:19:46.286+00');
INSERT INTO public.persona_puesto VALUES (3, 3, 2, 2, 1, '2026-08-06', true, '2026-08-06 16:19:46.327+00');
INSERT INTO public.persona_puesto VALUES (4, 4, 3, 1, 1, '2026-08-06', true, '2026-08-06 16:19:46.345+00');
INSERT INTO public.persona_puesto VALUES (5, 5, 3, 1, 1, '2026-08-06', true, '2026-08-06 16:19:46.36+00');
INSERT INTO public.persona_puesto VALUES (6, 6, 4, 6, 1, '2026-08-06', true, '2026-08-06 16:19:46.382+00');
INSERT INTO public.persona_puesto VALUES (7, 7, 4, 6, 1, '2026-08-06', true, '2026-08-06 16:19:46.402+00');
INSERT INTO public.persona_puesto VALUES (8, 8, 5, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.424+00');
INSERT INTO public.persona_puesto VALUES (9, 9, 5, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.441+00');
INSERT INTO public.persona_puesto VALUES (10, 10, 6, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.453+00');
INSERT INTO public.persona_puesto VALUES (11, 11, 6, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.465+00');
INSERT INTO public.persona_puesto VALUES (12, 12, 7, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.475+00');
INSERT INTO public.persona_puesto VALUES (13, 13, 7, 4, 1, '2026-08-06', true, '2026-08-06 16:19:46.483+00');
INSERT INTO public.persona_puesto VALUES (14, 1, 3, 1, 1, '2026-08-06', true, '2026-08-06 17:04:20.509+00');


--
-- Data for Name: queja; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.queja VALUES (1, 'Q-0001', 'Empresa Acme S.A. ACTUALIZADA', '555-1234', 'test@test.com', 'Pedro Lopez', 'Descripcion actualizada', 'Juan P�rez Garc�a', '2026-08-12', 'TECNICA', true, NULL, 'IAC-2026-012', 'Se revis� el certificado #CAL-2026-045 y se confirm� desviaci�n en punto 7.2.1. Se solicit� nueva calibraci�n al proveedor.', '2026-08-27', 'Se verifico la nueva calibracion y el equipo esta dentro de tolerancia. Certificado actualizado #CAL-2026-045-R1.', '2026-08-12', 'Maria Gonzalez Lopez', 'EN_SEGUIMIENTO', NULL, true, '2026-08-12 20:22:49.193+00', '2026-08-17 15:59:46.087+00', NULL);
INSERT INTO public.queja VALUES (2, 'Q-0002', 'Empresa de Prueba S.A.', '099-123-4567', 'contacto@prueba.com', 'Juan Perez (Representante)', 'El servicio de calibracion no cumple con los tiempos acordados. Se entrego el certificado 15 dias despues de lo pactado.', 'Ing. Maria Lopez - Recepcionista', '2026-08-17', 'GESTION_CALIDAD', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PROCEDENTE', NULL, true, '2026-08-17 19:14:02.408+00', '2026-08-17 19:15:36.833+00', NULL);


--
-- Data for Name: queja_responsable; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: riesgo_oportunidad; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.riesgo_oportunidad VALUES (1, 'R-0001', 'RIESGO', 'JDC_IMPARCIALIDAD', 'Posible sesgo en la emisi�n de resultados por presi�n externa', 'Relaci�n comercial con el cliente', 'Externa', 'Afecta la imparcialidad y la confianza en el laboratorio', 5, 7, 6, 210, 'ALTO', 'REDUCIR', 'Aplicar an�lisis de riesgos de imparcialidad semestral', NULL, 'EN_SEGUIMIENTO', 'Prueba E2E', false, '2026-08-12 17:19:41.139+00', '2026-08-12 17:20:06.151+00', NULL, NULL, NULL);
INSERT INTO public.riesgo_oportunidad VALUES (2, 'O-0001', 'OPORTUNIDAD', 'JDT_CALIBRACION', 'Demanda creciente de calibraci�n de equipos de nueva tecnolog�a', 'Nuevos sectores industriales', 'Externa', 'Ampliar la cartera de servicios', 6, 5, 3, 90, 'MODERADO', 'ASUMIR', 'Evaluar viabilidad t�cnica y capacitar personal', NULL, 'EN_SEGUIMIENTO', NULL, false, '2026-08-12 17:19:50.623+00', '2026-08-12 17:20:06.239+00', NULL, NULL, NULL);
INSERT INTO public.riesgo_oportunidad VALUES (3, 'R-0002', 'RIESGO', 'DCM', 'Falla en el sistema informatico del CMEE que impide el procesamiento de resultados', 'Infraestructura tecnologica obsoleta', 'Interna', 'Retraso en la emision de informes y perdida de confianza del cliente', 6, 7, 4, 168, 'MODERADO', 'REDUCIR', 'Implementar sistema de respaldo automatico y actualizar hardware', '2026-09-15', 'IDENTIFICADO', 'Prioridad alta por impacto en servicio al cliente', true, '2026-08-18 01:53:03.633+00', '2026-08-18 01:53:03.633+00', NULL, NULL, NULL);


--
-- Data for Name: riesgo_responsable; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.riesgo_responsable VALUES (1, 3, 'IDENTIFICACION', 'Jose Cusin', 'Jefe Dpto. Calidad', '2026-08-17', '2026-08-18 01:53:03.633+00');
INSERT INTO public.riesgo_responsable VALUES (2, 3, 'IDENTIFICACION', 'Noe Tapia', 'Jefe Dpto. Tecnico', '2026-08-17', '2026-08-18 01:53:03.633+00');


--
-- Data for Name: roles_carpetas; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: servicio; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Name: aplicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.aplicacion_id_seq', 7, true);


--
-- Name: auditoria_historial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.auditoria_historial_id_seq', 1, false);


--
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 662, true);


--
-- Name: auditoria_interna_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.auditoria_interna_id_seq', 11, true);


--
-- Name: carpetas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.carpetas_id_seq', 3, true);


--
-- Name: carpetas_permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.carpetas_permisos_id_seq', 3, true);


--
-- Name: certificado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.certificado_id_seq', 1, false);


--
-- Name: certificado_numero_certificado_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.certificado_numero_certificado_seq', 1, false);


--
-- Name: circuitos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.circuitos_id_seq', 1, true);


--
-- Name: clientes_institucionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.clientes_institucionales_id_seq', 1, false);


--
-- Name: departamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.departamento_id_seq', 10, true);


--
-- Name: documento_persona_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documento_persona_id_seq', 1, false);


--
-- Name: documentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documentos_id_seq', 5, true);


--
-- Name: documentos_relaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documentos_relaciones_id_seq', 1, false);


--
-- Name: documentos_versiones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documentos_versiones_id_seq', 5, true);


--
-- Name: documentos_workflow_fases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documentos_workflow_fases_id_seq', 6, true);


--
-- Name: documentos_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.documentos_workflow_id_seq', 3, true);


--
-- Name: equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.equipo_id_seq', 1, false);


--
-- Name: equipos_recepcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.equipos_recepcion_id_seq', 1, false);


--
-- Name: fases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.fases_id_seq', 2, true);


--
-- Name: fases_participantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.fases_participantes_id_seq', 2, true);


--
-- Name: firma_digital_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.firma_digital_id_seq', 1, false);


--
-- Name: firma_documento_fase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.firma_documento_fase_id_seq', 3, true);


--
-- Name: grupo_aplicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.grupo_aplicacion_id_seq', 14, true);


--
-- Name: grupo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.grupo_id_seq', 1, true);


--
-- Name: historial_estado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.historial_estado_id_seq', 1, false);


--
-- Name: intento_login_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.intento_login_id_seq', 51, true);


--
-- Name: laboratorio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.laboratorio_id_seq', 6, true);


--
-- Name: no_conformidad_historial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.no_conformidad_historial_id_seq', 7, true);


--
-- Name: no_conformidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.no_conformidad_id_seq', 33, true);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 2, true);


--
-- Name: ordenes_trabajo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.ordenes_trabajo_id_seq', 1, false);


--
-- Name: persona_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.persona_id_seq', 13, true);


--
-- Name: persona_puesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.persona_puesto_id_seq', 14, true);


--
-- Name: puesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.puesto_id_seq', 7, true);


--
-- Name: queja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.queja_id_seq', 2, true);


--
-- Name: queja_responsable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.queja_responsable_id_seq', 1, false);


--
-- Name: riesgo_oportunidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.riesgo_oportunidad_id_seq', 3, true);


--
-- Name: riesgo_responsable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.riesgo_responsable_id_seq', 2, true);


--
-- Name: rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.rol_id_seq', 1, false);


--
-- Name: roles_carpetas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.roles_carpetas_id_seq', 1, false);


--
-- Name: servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.servicio_id_seq', 1, false);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.usuario_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 2cXlMdV2WJsFyBoFxNI43mtwaOfumNRiaV8AuFdUDQSpoNxspYKmPfWNQZXwynQ

