# Auditoría Técnica — SGD-CMEE vs. Plan de Trabajo de Pasantía

**Fecha de auditoría:** 2026-07-09
**Auditor:** Revisión técnica automatizada sobre el estado real del repositorio (`backend/` NestJS + Prisma, `frontend/` React)
**Documento base:** `REQUERIMIENTOS_CMEE.txt`, Sección 8 — "Módulos mínimos que debe contener la aplicación"
**Metodología:** Lectura directa de modelos Prisma (`backend/prisma/schema.prisma`), controllers/services de cada módulo NestJS, y páginas/componentes React correspondientes. No se asumió nada por nombre de carpeta — se verificó lógica real.

> **Nota de alcance:** esta auditoría es de código, no de datos. No puedo verificar desde el repositorio si existen exactamente 5 laboratorios cargados en la base de datos, ni si hay usuarios reales configurados — eso depende del contenido de la BD en runtime.

---

## Resumen ejecutivo

| # | Módulo (Sección 8) | Estado | Cobertura estimada |
|---|---|---|---|
| 8.1 | Administración del sistema | ⚠️ A medias | ~60% |
| 8.2 | Módulo administrativo | ✅ Completo (con matices) | ~85% |
| 8.3 | Módulo de laboratorios | ✅ Completo | ~90% |
| 8.4 | Módulo de certificados | ⚠️ A medias — *corregido, ver nota* | ~50% |
| 8.5 | Módulo de validación y firma | ⚠️ A medias | ~65% |
| 8.6 | Módulo de gestión de calidad | ❌ No iniciado (existe infraestructura reutilizable) | ~15% |
| 8.7 | Módulo de reportes | ❌ No iniciado | 0% |

**Lectura general:** el proyecto tiene una base RBAC y de flujo de trabajo (workflow de estados) sólida y bien diseñada — de hecho, mejor de lo que exige el mínimo del plan. Pero los tres módulos que el propio documento marca como "eje crítico del proyecto" (certificados, calidad, reportes) son los menos desarrollados. Semana 9 y 10 del cronograma (certificados + validación) son exactamente donde hay que enfocar el esfuerzo inmediato.

---

## ✅ 8.1 Módulo de administración del sistema — A MEDIAS (~60%)

| Requisito | Estado | Evidencia |
|---|---|---|
| Usuarios | ✅ | `backend/src/usuarios/` (CRUD completo, hash de contraseña, login JWT). Frontend: `frontend/src/modules/usuarios/UsuariosPage.tsx`, `UsuarioFormPage.tsx` |
| Roles y permisos | ✅ | RBAC real vía `Grupo` + `Aplicacion` + nivel (1–5), enforced por `backend/src/auth/guards/access.guard.ts` + decorador `@RequireAccess`. Frontend: `UsuariosGrupoPage.tsx`, `GrupoFormPage.tsx`. Esto es más granular de lo que pide el documento (permite nivel de acceso por app, no solo rol fijo) |
| Bitácora de accesos | ⚠️ | `backend/src/auditoria/auditoria.interceptor.ts` registra **mutaciones** (POST/PATCH/DELETE) y GETs filtrados en la tabla `auditoria`, con UI en `frontend/src/modules/auditoria/AuditoriaPage.tsx`. **Gap real:** el interceptor lee `req.user`, que solo existe **después** de pasar `JwtAuthGuard` — el endpoint `POST /usuarios/login` (`usuarios.controller.ts:33`) ocurre antes de tener token, así que **los intentos de login (exitosos o fallidos) no quedan registrados**. Lo que hay es bitácora de *acciones dentro del sistema*, no bitácora de *accesos* en sentido estricto |
| Configuración general | ❌ | No existe módulo de configuración (parámetros del sistema, nombre institucional editable, etc.). El nombre "Centro de Metrología del Ejército Ecuatoriano" está hardcodeado en `backend/prisma/schema.prisma:334` (`Documento.empresa`) y en el frontend, no es configurable desde UI |
| Respaldo de información | ❌ | No hay ninguna funcionalidad de backup/export de base de datos en la aplicación. Los respaldos, si existen, son manuales fuera del sistema (`pg_dump` u otro, no verificable desde código) |

---

## ✅ 8.2 Módulo administrativo — COMPLETO CON MATICES (~85%)

| Requisito | Estado | Evidencia |
|---|---|---|
| Registro de solicitudes | ✅ | `backend/src/recepcion-equipos/` — modelo Maestro-Detalle `OrdenTrabajo` + `EquipoRecepcion`. Frontend: `FormOrdenTrabajo.tsx`, `RecepcionesPage.tsx` |
| Control de estado de trámites | ✅ | Enum `EstadoRecepcion` (8 estados) con máquina de estados real en `recepcion-equipos.service.ts` (`transicionEstado`), no solo un campo de texto libre |
| Registro de unidades solicitantes | ✅ | `backend/src/clientes-institucionales/` — extendido recientemente con RUC, representante, dirección, teléfono, email. Frontend: `ClientesPage.tsx` |
| Seguimiento de actividades | ✅ | `frontend/src/modules/administrativo/pages/BandejaTrabajoPage.tsx` — bandeja de trabajo filtrada por puesto/rol (técnico, observador, jefe, director, RSEC), con `HistorialEstado` como trazabilidad de cambios |
| Reportes administrativos | ❌ | No existe generación de reportes administrativos (conteos, tiempos, exportables). La única "vista agregada" son los 3 KPI cards (`Total`, `En Espera`, `En Calibración`) en `BandejaTrabajoPage.tsx` — son contadores en memoria del array ya cargado, no un reporte real (sin exportar, sin filtro de fechas, sin período) |

---

## ✅ 8.3 Módulo de laboratorios — COMPLETO (~90%)

| Requisito | Estado | Evidencia |
|---|---|---|
| Registro de los cinco laboratorios | ✅ (estructura) | Modelo `Laboratorio` en schema, CRUD en `backend/src/laboratorios/`. **No verificable desde código si hay exactamente 5 registros cargados** — es dato de BD, no de código |
| Responsables por laboratorio | ✅ | `Laboratorio.responsable_id → Persona` (schema.prisma:520-521) |
| Servicios ofertados | ✅ | Modelo `Servicio` (con `magnitud`), `backend/src/servicios/`. Frontend: `ServiciosPage.tsx`, `NuevoServicioPage.tsx` |
| Equipos asociados | ✅ | Modelo `Equipo` (patrimonial, distinto de `EquipoRecepcion` que es el equipo del cliente en calibración — dos conceptos separados, correctamente modelados). `backend/src/equipos/`, frontend `EquiposPages.tsx` |
| Información técnica por laboratorio | ✅ | Vía relaciones `Departamento.laboratorio_id`, `Equipo.laboratorio_id`, `Servicio.laboratorio_id` — la info técnica está distribuida correctamente, no centralizada en un solo campo, lo cual es el diseño correcto |

---

## ⚠️ 8.4 Módulo de certificados — A MEDIAS (~50%)

> **Corrección post-auditoría (2026-07-09):** el hallazgo original marcaba la ausencia de generación de PDF como el gap crítico del módulo. Esto fue **corregido tras confirmar con el desarrollador** que es una decisión de diseño intencional: el Centro ya usa plantillas Excel propias para elaborar los certificados y no va a dejar de usarlas. El flujo real es "el técnico elabora el certificado en su plantilla, lo exporta a PDF, lo sube y se firma dentro de la plataforma" — eso es válido y no debe reconstruirse. La cobertura estimada sube de ~35% a ~50% con esta corrección, y las prioridades del plan de acción se ajustan en consecuencia (ver sección final).

| Requisito (8.4) | Estado | Evidencia |
|---|---|---|
| Creación de certificados | ✅ (con matiz) | No hay formulario de creación *dentro* del sistema, pero es intencional: el certificado se elabora en la plantilla Excel institucional existente y se incorpora al sistema vía `POST /certificados/upload`. Cumple el requisito bajo la restricción confirmada del Centro |
| Carga de información técnica | ⚠️ | La info técnica del **equipo** sí se captura (marca, modelo, serie, accesorios, requerimientos de calibración — en `EquipoRecepcion`). Los datos técnicos específicos del certificado (magnitud calibrada, patrón, incertidumbre, resultados) viven solo dentro del PDF/Excel, no están estructurados en la base de datos — esto es aceptable para el flujo actual, pero limita a futuro la posibilidad de generar reportes o búsquedas sobre esos datos sin abrir cada PDF |
| Generación de certificados en PDF | ✅ (satisfecho fuera del sistema, por decisión institucional) | El PDF se genera en la plantilla Excel del Centro, no en la aplicación — cumple la necesidad real sin reconstruir una herramienta que ya existe y funciona |
| Control de numeración | ❌ | El modelo `Certificado` (`schema.prisma:732-748`) no tiene ningún campo de numeración correlativa. Existe `OrdenTrabajo.orden_trabajo_fisica` (número preimpreso físico de la orden), pero **no hay numeración propia del certificado emitido**. **En progreso** — ver plan de acción |
| Estados del certificado | ⚠️ | No hay estado en el `Certificado` en sí — el estado vive en `EquipoRecepcion.estado` (`EstadoRecepcion`), que sube de nivel cuando se sube el PDF. Funcionalmente cubre el caso de uso, pero conceptualmente el certificado no es una entidad con ciclo de vida propio, sino un adjunto del flujo del equipo |
| Historial de cambios | ✅ | `HistorialEstado` sí traza cada transición (quién, cuándo, acción, observaciones) — esto es sólido |
| Repositorio de certificados emitidos | ⚠️ | Existe almacenamiento (`backend/uploads/`) y descarga (`GET /certificados/download/:id`), pero no hay una vista de "repositorio" navegable/buscable en el frontend — solo se accede al PDF desde el botón "Ver Certificado" dentro de la fila de su orden en `BandejaTrabajoPage.tsx`. No hay búsqueda por rango de fechas, cliente, laboratorio, o número |

---

## ⚠️ 8.5 Módulo de validación y firma — A MEDIAS (~65%)

| Requisito | Estado | Evidencia |
|---|---|---|
| Revisión técnica | ✅ | Estado `REVISION_OBT`, ejecutado por rol "Observador Técnico" — `recepcion-equipos.service.ts::transicionEstado` |
| Validación del jefe de laboratorio | ✅ | Estado `REVISION_JEFE`, permiso restringido a puesto "Jefe" |
| Aprobación de calidad, si corresponde | ❌ | No existe un paso de aprobación etiquetado específicamente como "Calidad" — el flujo pasa de `REVISION_JEFE` directo a `REVISION_DIRECTOR`. No hay un rol/puesto de "Calidad" en la máquina de estados |
| Firma o aprobación final | ⚠️ (mejor de lo evaluado inicialmente) | El estado `PENDIENTE_FIRMA_TECNICO` + el paso `REVISION_DIRECTOR` → `LISTO_PARA_ENTREGA`, sumado a que cada transición queda en `HistorialEstado` con `realizado_por_id` y timestamp, constituye en la práctica un rastro de "firma con trazabilidad" — confirmado por el desarrollador que el modelo institucional es "cargar y firmar dentro de la plataforma", no firma electrónica con PKI. Bajo esa definición, el requisito está funcionalmente cubierto. Sigue faltando que ese rastro se etiquete/exponga explícitamente como firma (hoy es solo un cambio de estado con botón "Aprobación Final") |
| Control de observaciones | ✅ | Campo `observaciones` obligatorio al rechazar (`transicion-estado.dto.ts` + validación en el service), UI en `ValidacionCertificadoModal.tsx` |
| Código de verificación o identificador único | ❌ | No existe ningún campo de código de verificación, QR, ni identificador público para que un tercero valide la autenticidad de un certificado emitido. **En progreso** — ver plan de acción |

---

## ❌ 8.6 Módulo de gestión de calidad — NO INICIADO COMO TAL (~15%)

**Hallazgo clave:** el módulo `gestor_documental` (backend: `carpetas/`, `documentos/`, `circuitos/`) **no está pensado como "gestión de calidad"** — es un gestor documental genérico con circuitos de aprobación configurables. Tiene piezas reutilizables, pero falta el dominio semántico de calidad.

| Requisito (8.6) | Estado | Evidencia |
|---|---|---|
| Control documental | ✅ (genérico) | `Carpeta` jerárquica + `Documento`, `backend/src/carpetas/`, `backend/src/documentos/`. Frontend: `gestor_documental/pages/` |
| Registros de calidad | ❌ | No existe un tipo de entidad "registro de calidad" — solo documentos genéricos sin esa taxonomía |
| Control de versiones | ✅ | `DocumentoVersion` (schema.prisma:363-374) — historial de versiones con comentario y quién subió |
| Acciones de mejora | ❌ | No existe ninguna entidad, endpoint ni pantalla |
| No conformidades | ❌ | No existe ninguna entidad, endpoint ni pantalla |
| Trazabilidad documental | ✅ | `DocumentoWorkflow` + `Fase` + `DocumentoWorkflowFase` (schema.prisma:376-405) — sistema de circuitos configurable con estados `EN_CURSO/COMPLETADO/RECHAZADO` por fase. Es una base técnica **fuerte**, solo le falta aplicarse al dominio de calidad |
| Indicadores de gestión | ❌ | No existe ningún dashboard de KPIs de calidad (tiempos de ciclo, tasa de no conformidades, etc.) |

---

## ❌ 8.7 Módulo de reportes — NO INICIADO (0%)

Búsqueda exhaustiva (`grep -r "reporte" backend/src frontend/src`) no arroja ningún módulo, endpoint ni página dedicada a reportes.

| Requisito | Estado |
|---|---|
| Reportes por laboratorio | ❌ |
| Certificados emitidos | ❌ |
| Certificados pendientes | ❌ |
| Certificados observados | ❌ |
| Tiempos de atención | ❌ |
| Reportes de calidad | ❌ |
| Reportes administrativos | ❌ |

Lo más cercano que existe son los 3 contadores en `BandejaTrabajoPage.tsx` (Total / En Espera / En Calibración), que **no son reportes** en el sentido del documento (no exportables, no filtrables por fecha/laboratorio/cliente, no persistentes, se recalculan en el cliente sobre los datos ya cargados en pantalla).

---

## Hallazgos transversales (no pedidos explícitamente, pero relevantes para la memoria técnica)

1. **Fortaleza no exigida por el mínimo:** el RBAC (`AccessGuard` + niveles 1-5 por aplicación) es más sofisticado que un simple "rol fijo" — vale la pena documentarlo como valor agregado en la memoria técnica, sección "Descripción de módulos".
2. **Cobertura de pruebas:** casi inexistente (`backend/src/*.spec.ts` son en su mayoría los tests por defecto de NestJS). El plan pide "Matriz de pruebas funcionales" (Semana 14) y "Evidencias de pruebas" como entregable — esto va a requerir trabajo dedicado, no se puede improvisar al final.
3. **Nomenclatura a aclarar en la memoria técnica:** el sistema tiene dos conceptos llamados de forma parecida que no hay que confundir — `Roles` (RRHH, catálogo de cargos como "Técnico", "Jefe de Laboratorio") vs. `Grupos` (control de acceso, con niveles por aplicación). El documento de requerimientos usa "Roles y permisos" (8.1) refiriéndose al segundo concepto.
4. **Generación de PDF — confirmado como decisión institucional, no como deuda técnica:** el Centro usa plantillas Excel propias para elaborar los certificados y no las va a reemplazar. El sistema carga y firma esos PDF, no los genera. Esto reduce significativamente el alcance real de la Semana 9 respecto a la lectura inicial del documento.
5. **El gap real que queda es "identificador de verificación pública"**, no "firma" en sí — es el requisito más citado en los "Criterios de aceptación" (Sección 11) y el único punto de 8.4/8.5 sin ninguna cobertura, ni siquiera parcial. **En progreso**, ver plan de acción.

---

## Plan de acción priorizado — Semana 9 y 10

El propio documento define el resultado esperado de estas dos semanas: *"Semana 9: Generación inicial de certificados en la aplicación"* y *"Semana 10: Flujo de revisión y validación implementado"*. Con la generación de PDF resuelta institucionalmente (plantillas Excel del Centro) y el flujo de estados ya construido en `EstadoRecepcion`, el alcance real pendiente es más chico de lo que sugería la lectura inicial del documento — se reduce a numeración, identificador de verificación y un repositorio navegable.

### Semana 9 — Módulo de certificados

| # | Tarea | Estado | Alcance técnico |
|---|---|---|---|
| 1 | Numeración correlativa (`numero_certificado`) | 🔧 **En progreso** | `Certificado.numero_certificado` — entero autoincremental único a nivel de base de datos (secuencia propia de Postgres vía `@default(autoincrement())`), formateado para mostrar como `CMEE-{año}-{000000}` |
| 2 | Código de verificación (`codigo_verificacion`) | 🔧 **En progreso** | `Certificado.codigo_verificacion` — UUID único vía `@default(uuid())`, no adivinable, base para un futuro endpoint público de verificación |
| 3 | Endpoint público de verificación | ⏭️ Siguiente paso natural, no iniciado aún | `GET /certificados/verificar/:codigo` sin JWT — devuelve metadatos seguros (número, fecha, laboratorio, cliente, estado) sin exponer el PDF. Cierra el requisito más citado de la Sección 11 |
| 4 | Repositorio navegable de certificados | ❌ No iniciado | Vista tipo `RecepcionesPage.tsx` pero para certificados: filtro por laboratorio, cliente, rango de fechas, número |
| ~~5~~ | ~~Generación de PDF desde el sistema~~ | **Retirado del alcance** | Decisión institucional confirmada: el PDF se elabora en la plantilla Excel del Centro, no en la aplicación |

### Semana 10 — Flujo de validación (prioridad alta, menor esfuerzo)

| # | Tarea | Estado actual | Qué falta |
|---|---|---|---|
| 1 | Estados del certificado | ⚠️ A nivel de equipo, no del certificado | Vive en `EquipoRecepcion.estado` vía `EstadoRecepcion` — funciona, pero si a futuro hay múltiples certificados por equipo (recalibraciones), convendría estado propio por certificado |
| 2 | Observaciones por revisor | ✅ Ya implementado | Nada — `transicion-estado.dto.ts` + `ValidacionCertificadoModal.tsx` cubren esto bien |
| 3 | Historial de cambios | ✅ Ya implementado | Nada — `HistorialEstado` ya lo cubre |
| 4 | Asignación de responsables por etapa | ✅ Ya implementado | Nada — `resolveOrdenWhere` + normalización de puesto en `recepcion-equipos.service.ts` ya resuelve esto por rol |
| 5 | "Firma" dentro de la plataforma | ✅ Cubierto bajo la definición institucional confirmada | `PENDIENTE_FIRMA_TECNICO` + `HistorialEstado` (quién, cuándo) ya constituyen el rastro de firma que el Centro espera — no se requiere PKI ni firma electrónica |
| 6 | Paso de "Calidad" explícito | ❌ No existe | Definir con el Centro si "Calidad" es un puesto distinto de "Jefe de Laboratorio"/"Director", y en tal caso insertar un estado `REVISION_CALIDAD` en el enum `EstadoRecepcion` + su rama en el `switch` de `transicionEstado()` |
| 7 | Código de verificación / identificador único | 🔧 **En progreso** (ver tarea 9.2) | — |

### Fuera de Semana 9-10 pero para no perder de vista

- **Semana 11 (firma):** dado que hoy no hay ningún mecanismo de firma, esta semana va a requerir definición institucional temprana (¿firma electrónica simple, firma con certificado digital, o solo un "sello" interno del sistema?). Recomiendo levantar esta decisión con el Centro **ahora**, en paralelo a Semana 9, porque condiciona el modelo de datos de `Certificado` que se está diseñando en este momento — cambiarlo después de implementado sale más caro.
- **Módulo de reportes (8.7) y calidad (8.6):** no tienen semana dedicada explícita salvo la 12 (calidad) — están en riesgo de quedar sin tiempo si Semana 9-10 se extiende. Sugiero no perder de vista el cronograma de 16 semanas mientras se resuelve el hueco de certificados.
