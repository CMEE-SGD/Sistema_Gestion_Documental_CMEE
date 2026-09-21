import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TipoAuditoria,
  EstadoAuditoria,
  EstadoNC,
  ClasificacionNC,
  EstadoQueja,
  TipoRiesgo,
  EstadoRiesgo,
  TratamientoRiesgo,
} from '@prisma/client';

/**
 * Sembrador de datos de ejemplo del módulo de Calidad: auditorías (internas y
 * externas), no conformidades, quejas, riesgos y oportunidades.
 *
 * Se ejecuta al iniciar el módulo (OnModuleInit) siguiendo el patrón de
 * AplicacionesSeeder. Es 100% idempotente y seguro:
 *  - Todos los upserts usan `update: {}`, de modo que si el registro ya
 *    existe, NO se toca (nunca pisa datos reales).
 *  - Las NC se siembran adheridas a las auditorías sembradas (la única
 *    UNIQUE es compuesta (auditoria_id, codigo), por lo que viven en su
 *    propio espacio con numeración 1, 2, 3... tal como las genera el backend).
 *  - Los códigos siguen las reglas del servicio: auditoría 'YY NNNNNN',
 *    queja 'Q-000N', riesgo 'R-000N', oportunidad 'O-000N'. Los códigos de
 *    ejemplo quedan fuera del rango de los secuenciales reales para no
 *    chocar ni con los generadores ni con datos existentes.
 *  - Los JSON respetan las estructuras que usan los formularios del frontend
 *    (equipo_auditor, cronograma, testificaciones, tipo_evaluacion,
 *    documentos_referencia, plan_accion, verificacion_eficacia).
 *  - `nivel_riesgo` y `condicion` se calculan como en la API:
 *    P x I x D; >= 200 ALTO | 80..199 MODERADO | < 80 LEVE.
 */
@Injectable()
export class CalidadSeeder implements OnModuleInit {
  private readonly logger = new Logger(CalidadSeeder.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Sincronizando datos de ejemplo del módulo de Calidad...');

    // Personas ACTIVO existentes para asignar responsable_id a las auditorías
    // internas (si no hay personas, se deja null sin romper nada).
    const personas = await this.prisma.persona.findMany({
      where: { estado: 'ACTIVO' },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 4,
    });
    const responsableDe = (i: number) => (personas.length ? personas[i % personas.length].id : null);

    // ==================== AUDITORÍAS ====================
    const auditorias = [
      {
        codigo: '26 000001',
        tipo: TipoAuditoria.INTERNA,
        estado: EstadoAuditoria.PLANIFICADA,
        descripcion: 'Auditoría Interna de Calidad 2026-II',
        objeto:
          'Determinar si la gestión y las actividades del CMEE son conformes con los requisitos de la Norma NTE INEN ISO/IEC 17025:2017 y con los requisitos establecidos en el sistema de gestión.',
        alcance:
          'Aplica al sistema de gestión del Departamento de Calidad y del Departamento Técnico del CMEE, incluidos los procesos de calibración y caracterización.',
        documentos_referencia: [
          'Manual de Calidad MC-CMEE-001 Rev. 5',
          'NTE INEN ISO/IEC 17025:2017',
          'Procedimiento de Auditorías Internas PR-CAL-007',
        ],
        responsable_auditoria: 'Responsable Técnico del CMEE',
        equipo_auditor: [
          { seccion: 'EVALUADOR_LIDER', funcion: 'Evaluador líder', nombre: 'May. Garzón Muñoz Marcelo Javier', designacion: 'EL' },
          { seccion: 'EVALUADOR_CALIDAD', funcion: 'Evaluador de gestión de la calidad', nombre: 'Ing. Tobar Villacís Ana Cristina', designacion: 'EG' },
          { seccion: 'EVALUADOR_TECNICO', funcion: 'Evaluador Técnico', nombre: 'Ing. Paredes Salazar Luis Fernando', designacion: 'ET', tipo_funcion: 'ET-1' },
          { seccion: 'OBSERVADOR', funcion: 'Observador', nombre: 'Tnte. Roldán Jaramillo Pablo Andrés', designacion: 'OBS' },
        ],
        cronograma: [
          {
            fecha: '2026-10-05',
            actividades: [
              { hora: '08:00 – 08:30', actividad: 'Reunión de apertura', evaluador: 'EL', referencia: 'Anexo A' },
              { hora: '08:30 – 12:00', actividad: 'Revisión documental del sistema de gestión', evaluador: 'EL, EG', referencia: '8.2' },
              { hora: '14:00 – 17:00', actividad: 'Auditoría al proceso de calibración de masa', evaluador: 'ET', referencia: '7.2' },
            ],
          },
          {
            fecha: '2026-10-06',
            actividades: [
              { hora: '08:30 – 12:00', actividad: 'Auditoría al proceso de gestión de equipos y patrones', evaluador: 'ET', referencia: '6.4' },
              { hora: '14:00 – 16:30', actividad: 'Auditoría al proceso de desempeño organizacional', evaluador: 'EG', referencia: '8.6' },
            ],
          },
        ],
        testificaciones: [],
        observaciones: 'Programa anual de auditorías 2026, segunda evaluación al SGC.',
        fecha_inicio: new Date('2026-10-05'),
        fecha_fin: new Date('2026-10-06'),
        responsable_id: responsableDe(0),
        fecha_elaboracion: new Date('2026-09-01'),
        elaborado_por: 'Jefe del Departamento de Calidad',
        createdAt: new Date('2026-09-01T10:00:00Z'),
      },
      {
        codigo: '26 000002',
        tipo: TipoAuditoria.INTERNA,
        estado: EstadoAuditoria.EN_CURSO,
        descripcion: 'Auditoría Interna Semestral al Laboratorio de Masa y Balanzas',
        objeto:
          'Evaluar la conformidad de las actividades del Laboratorio de Masa con la norma de acreditación y verificar la eficacia de acciones correctivas anteriores.',
        alcance:
          'Procesos de calibración de masas, control de patrones de referencia y registros técnicos del Laboratorio de Masa y Balanzas.',
        documentos_referencia: [
          'Procedimiento de Calibración de Masas PR-LM-003',
          'NTE INEN ISO/IEC 17025:2017',
        ],
        responsable_auditoria: 'Jefe del Laboratorio de Masa y Balanzas',
        equipo_auditor: [
          { seccion: 'EVALUADOR_LIDER', funcion: 'Evaluador líder', nombre: 'Ing. Tobar Villacís Ana Cristina', designacion: 'EL' },
          { seccion: 'EVALUADOR_CALIDAD', funcion: 'Evaluador de gestión de la calidad', nombre: 'May. Garzón Muñoz Marcelo Javier', designacion: 'EG' },
          { seccion: 'EVALUADOR_TECNICO', funcion: 'Evaluador Técnico', nombre: 'Ing. Paredes Salazar Luis Fernando', designacion: 'ET', tipo_funcion: 'ET-2' },
        ],
        cronograma: [
          {
            fecha: '2026-07-13',
            actividades: [
              { hora: '09:00 – 09:20', actividad: 'Reunión de apertura', evaluador: 'EL', referencia: '—' },
              { hora: '09:20 – 11:30', actividad: 'Observación de calibraciones de masas', evaluador: 'ET', referencia: '7.4' },
              { hora: '14:00 – 16:00', actividad: 'Revisión de trazabilidad de patrones', evaluador: 'EL, EG', referencia: '6.5' },
            ],
          },
          {
            fecha: '2026-07-14',
            actividades: [
              { hora: '09:00 – 12:00', actividad: 'Entrevistas y revisión de registros', evaluador: 'EG', referencia: '7.5' },
              { hora: '15:00 – 16:30', actividad: 'Reunión de cierre', evaluador: 'EL', referencia: 'Anexo B' },
            ],
          },
        ],
        testificaciones: [
          { test: '1', metodo_ensayo: 'Calibración de pesas de clase E2 y F1', metodo_magnitud: 'Masa', muestra: 'Pesa de 1 kg', evaluador: 'ET' },
        ],
        observaciones: 'Auditoría en ejecución. Las no conformidades detectadas se registran en el detalle.',
        fecha_inicio: new Date('2026-07-13'),
        fecha_fin: new Date('2026-07-14'),
        responsable_id: responsableDe(1),
        fecha_elaboracion: new Date('2026-06-20'),
        elaborado_por: 'Jefe del Departamento de Calidad',
        createdAt: new Date('2026-06-20T09:00:00Z'),
      },
      {
        codigo: '26 000003',
        tipo: TipoAuditoria.EXTERNA,
        estado: EstadoAuditoria.EN_CURSO,
        nombre_oec: 'Organismo de Acreditación Ecuatoriano (OAE)',
        expediente_nro: 'OAE LC-08-004',
        tipo_oec: 'Organismo Nacional de Acreditación',
        email_oec: 'evaluacion@oae.gob.ec',
        ciudad_pais: 'Quito, Ecuador',
        telefono_oec: '2414432; 2411850; EXT 105/102',
        direccion_oficina:
          'Av. Los Pinos N7-105 y Av. 6 de Diciembre / Urb. Kennedy - FUERTE MILITAR RUMIÑAHUI',
        localizaciones_criticas: 'OFICINA MATRIZ',
        persona_contacto: 'May. Garzón Muñoz Marcelo Javier',
        norma_acreditacion:
          'NTE INEN-ISO/IEC 17025:2018 Requisitos generales para la competencia de los laboratorios de ensayo y calibración',
        actividades_evaluacion: 'Evaluación: In Situ, Testificación: Presencial',
        tipo_evaluacion: ['Vigilancia N° 2'],
        fecha_evaluacion_anterior: '2025-08-21 y 22',
        fecha_testificacion: 'N/A',
        localizaciones_evaluacion: 'OFICINA MATRIZ - REMOTO',
        idioma_evaluacion: 'ESPAÑOL',
        equipo_auditor: [
          { modalidad: 'IN_SITU', rol: 'Evaluador Líder', nombre: 'Ing. Aguirre Salazar María Fernanda', telefono: 'EXT 120', email: 'evaluador1@oae.gob.ec', entidad: 'OAE', alcance: 'Sistema de gestión' },
          { modalidad: 'IN_SITU', rol: 'Evaluador Técnico', nombre: 'Ing. León Cevallos Roberto', telefono: 'EXT 121', email: 'evaluador2@oae.gob.ec', entidad: 'OAE', alcance: 'Calibración de masa, volumen y presión' },
          { modalidad: 'REMOTO', rol: 'Observador', nombre: 'Ing. Núñez Guerra Paola', telefono: 'EXT 122', email: 'observador@oae.gob.ec', entidad: 'OAE', alcance: 'Seguimiento' },
        ],
        cronograma: [
          {
            fecha: '2026-08-24',
            actividades: [
              { hora: '08:30 – 09:00', actividad: 'Reunión de apertura', evaluador: 'EL', referencia: '—' },
              { hora: '09:00 – 12:30', actividad: 'Evaluación del sistema de gestión', evaluador: 'EL', referencia: '8.1 - 8.9' },
              { hora: '14:00 – 17:00', actividad: 'Evaluación técnica de calibraciones', evaluador: 'ET', referencia: '7.2 - 7.6' },
            ],
          },
          {
            fecha: '2026-08-25',
            actividades: [
              { hora: '09:00 – 12:00', actividad: 'Verificación de trazabilidad e incertidumbre', evaluador: 'ET', referencia: '6.5' },
              { hora: '15:00 – 16:30', actividad: 'Reunión de cierre con el equipo evaluador', evaluador: 'EL, OBS', referencia: 'Anexo C' },
            ],
          },
        ],
        testificaciones: [
          { test: '1', metodo_ensayo: 'Calibración de manómetros digitales', metodo_magnitud: 'Presión', muestra: 'Manómetro marca WIKA', evaluador: 'ET' },
        ],
        observaciones: 'Evaluación de vigilancia en curso. Se registró la no conformidad de proceso de compras.',
        alcance:
          'Competencia técnica y conformidad del CMEE con los requisitos de la norma de acreditación para los servicios de calibración vigentes.',
        fecha_inicio: new Date('2026-08-24'),
        fecha_fin: new Date('2026-08-25'),
        responsable_id: null,
        fecha_elaboracion: new Date('2026-07-15'),
        elaborado_por: 'Director Técnico del CMEE',
        createdAt: new Date('2026-07-15T14:00:00Z'),
      },
      {
        codigo: '25 000001',
        tipo: TipoAuditoria.INTERNA,
        estado: EstadoAuditoria.CERRADA,
        descripcion: 'Auditoría Interna de Calidad 2025',
        objeto:
          'Evaluar la implementación y eficacia del sistema de gestión de la calidad durante 2025 y verificar el cierre de las no conformidades de la evaluación anterior.',
        alcance:
          'Todos los procesos del sistema de gestión de la calidad del CMEE sujetos a la norma NTE INEN ISO/IEC 17025:2017.',
        documentos_referencia: [
          'Manual de Calidad MC-CMEE-001 Rev. 4',
          'NTE INEN ISO/IEC 17025:2017',
          'Informe de revisión por la dirección 2025',
        ],
        responsable_auditoria: 'Responsable Técnico del CMEE',
        equipo_auditor: [
          { seccion: 'EVALUADOR_LIDER', funcion: 'Evaluador líder', nombre: 'Ing. Paredes Salazar Luis Fernando', designacion: 'EL' },
          { seccion: 'EVALUADOR_CALIDAD', funcion: 'Evaluador de gestión de la calidad', nombre: 'Ing. Tobar Villacís Ana Cristina', designacion: 'EG' },
          { seccion: 'EVALUADOR_ENTRENAMIENTO', funcion: 'Evaluador en entrenamiento', nombre: 'Tnte. Roldán Jaramillo Pablo Andrés', designacion: 'EE' },
        ],
        cronograma: [
          {
            fecha: '2025-09-08',
            actividades: [
              { hora: '08:30 – 09:00', actividad: 'Reunión de apertura', evaluador: 'EL', referencia: '—' },
              { hora: '09:00 – 12:00', actividad: 'Auditoría documental de todo el SGC', evaluador: 'EL, EG', referencia: '8.2' },
              { hora: '14:00 – 17:00', actividad: 'Auditoría a los laboratorios de masa y presión', evaluador: 'EE, EL', referencia: '7.2' },
            ],
          },
          {
            fecha: '2025-09-09',
            actividades: [
              { hora: '09:00 – 11:30', actividad: 'Auditoría al proceso de recepción y entrega de equipos', evaluador: 'EG', referencia: '7.1' },
              { hora: '15:00 – 16:30', actividad: 'Reunión de cierre', evaluador: 'EL', referencia: 'Anexo A' },
            ],
          },
        ],
        testificaciones: [
          { test: '1', metodo_ensayo: 'Calibración de manómetros de referencia', metodo_magnitud: 'Presión', muestra: 'Manómetro de referencia 0-6 bar', evaluador: 'ET' },
          { test: '2', metodo_ensayo: 'Calibración de pinzas y pesas', metodo_magnitud: 'Masa', muestra: 'Pesa de 5 kg', evaluador: 'EE' },
        ],
        observaciones: 'Auditoría cerrada. Las NC identificadas fueron cerradas satisfactoriamente.',
        fecha_inicio: new Date('2025-09-08'),
        fecha_fin: new Date('2025-09-09'),
        responsable_id: responsableDe(2),
        fecha_elaboracion: new Date('2025-08-20'),
        elaborado_por: 'Jefe del Departamento de Calidad',
        createdAt: new Date('2025-08-20T08:30:00Z'),
      },
    ];

    const auditoriaIds: Record<string, number> = {};
    for (const a of auditorias) {
      const { codigo, ...datos } = a;
      const guardado = await this.prisma.auditoriaInterna.upsert({
        where: { codigo },
        update: {},
        create: {
          ...datos,
          codigo,
          historial: {
            create: [
              {
                estado_anterior: null,
                estado_nuevo: datos.estado,
                accion: 'CREACION',
                observaciones: 'Registro inicial de la auditoría (dato de ejemplo)',
                realizado_por_id: null,
                createdAt: datos.createdAt ?? new Date(),
              },
            ],
          },
        },
      });
      auditoriaIds[codigo] = guardado.id;
    }

    // ==================== NO CONFORMIDADES (adheridas a auditorías) ====================
    const ncs = [
      // Auditoría 26 000002 (interna EN_CURSO) — 2 NC
      {
        auditoriaCodigo: '26 000002',
        codigo: '1',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 7.6',
        requisito_incumplido: 'Evaluación de la incertidumbre de medición',
        clasificacion: ClasificacionNC.MENOR,
        hallazgo:
          'En la calibración de pesas clase F1 no se documenta la evaluación completa de la incertidumbre de medición para el punto de 500 g.',
        evidencia: 'Registro CAL-MASA-067 del 2026-07-10, columna de incertidumbre sin valor.',
        aceptada_oec: true,
        reiterada: false,
        causa_raiz: 'Plantilla de registro desactualizada que omite la casilla de incertidumbre.',
        acciones_inmediatas: 'Completar la incertidumbre del registro aplicando la guía GUM.',
        responsable_id: null,
        estado: EstadoNC.ABIERTA,
        createdAt: new Date('2026-07-15T11:00:00Z'),
      },
      {
        auditoriaCodigo: '26 000002',
        codigo: '2',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 6.4',
        requisito_incumplido: 'Control de los equipos',
        clasificacion: ClasificacionNC.MAYOR,
        hallazgo:
          'La balanza electrónica de verificación (código BL-031) operó más allá de su fecha de calibración sin etiqueta que lo evidencie.',
        evidencia: 'Registro de uso de la balanza BL-031 del período 2026-06-01 a 2026-07-12.',
        aceptada_oec: true,
        reiterada: false,
        causa_raiz:
          'Debilidad en el seguimiento de las fechas de calibración de equipos con uso esporádico.',
        acciones_inmediatas: 'Retirar de servicio la balanza BL-031 y coordinar su recalibración inmediata.',
        plan_accion: {
          analisisExtension:
            'La extensión del hallazgo cubre la verificación metrológica de todos los equipos con uso esporádico en el laboratorio.',
          obExtension: '',
          analisisCausa:
            'Falta un mecanismo automático de alertas por fecha de calibración; el estado lo controla manualmente un solo funcionario.',
          obCausa: '',
          causaRaiz:
            'No existe un registro único de control de calibraciones que consolide fechas y responsables de cada equipo.',
          correcciones: [
            {
              correccion: 'Retirar de servicio y recalibrar la balanza BL-031 antes de volver a utilizarla.',
              evidencia: 'Certificado de calibración 2026-08 emitido por el proveedor.',
              fecha: '2026-07-25',
              observaciones: 'Realizada sin novedad.',
              ob: '',
            },
          ],
          accionesCorrectivas: [
            {
              accion:
                'Implementar un consolidado de control de calibraciones con alertas automáticas de vencimiento por laboratorio.',
              evidencia: 'Reporte del consolidado actualizado al 2026-08-01.',
              fecha: '2026-08-01',
              observaciones: 'A cargo del técnico responsable del laboratorio.',
              ob: '',
            },
          ],
        },
        responsable_id: null,
        estado: EstadoNC.EN_CURSO,
        createdAt: new Date('2026-07-15T12:00:00Z'),
      },

      // Auditoría 26 000003 (externa SAE EN_CURSO) — 2 NC
      {
        auditoriaCodigo: '26 000003',
        codigo: '1',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 7.1',
        requisito_incumplido: 'Revisión de solicitudes, ofertas y contratos',
        clasificacion: ClasificacionNC.MENOR,
        hallazgo:
          'La orden de trabajo OT-2026-018 recibió una ampliación de alcance sin actualizar el contrato suscrito con el cliente.',
        evidencia: 'Expediente OT-2026-018, correo de fecha 2026-08-18.',
        aceptada_oec: true,
        reiterada: false,
        causa_raiz: 'El proceso de ampliación de alcance no contempla la enmienda contractual.',
        acciones_inmediatas: 'Suscribir la enmienda contractual y archivarla en el expediente.',
        plan_accion: {
          analisisExtension:
            'El hallazgo se limita a la gestión contractual del área de recepción.',
          obExtension: '1',
          analisisCausa:
            'El procedimiento PR-RSEC-002 no exige la actualización del contrato ante ampliaciones de alcance.',
          obCausa: '4',
          causaRaiz: 'Procedimiento documentado incompleto respecto a la gestión de cambios contractuales.',
          correcciones: [
            {
              correccion: 'Elaborar y firmar la enmienda contractual de la OT-2026-018.',
              evidencia: 'Enmienda contractual firmada.',
              fecha: '2026-08-28',
              observaciones: '',
              ob: '',
            },
          ],
          accionesCorrectivas: [
            {
              accion:
                'Actualizar PR-RSEC-002 para exigir enmienda firmada en toda ampliación de alcance y capacitar al personal de recepción.',
              evidencia: 'Documento PR-RSEC-002 Rev. 3 publicado.',
              fecha: '2026-09-10',
              observaciones: 'Se difundirá en reunión de proceso.',
              ob: '',
            },
          ],
        },
        verificacion_eficacia: {
          aprobado_por: 'Jefe del Departamento de Calidad',
          aprobado_por_id: null,
          fecha: '2026-09-05',
          resultado: 'EFICAZ',
          observaciones: 'La enmienda y el procedimiento actualizado fueron verificados durante la evaluación.',
        },
        responsable_id: null,
        estado: EstadoNC.VERIFICADA,
        createdAt: new Date('2026-08-26T10:00:00Z'),
      },
      {
        auditoriaCodigo: '26 000003',
        codigo: '2',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 6.6',
        requisito_incumplido: 'Productos y servicios suministrados externamente',
        clasificacion: ClasificacionNC.MENOR,
        hallazgo:
          'El proveedor de gases certificados no consta en la lista de proveedores evaluados para el periodo 2026.',
        evidencia: 'Orden de compra OC-2026-041 de gases patrón del 2026-07-03.',
        aceptada_oec: false,
        reiterada: false,
        causa_raiz: 'Cola de evaluación de proveedores pendiente por parte de Gestión Administrativa.',
        acciones_inmediatas: 'Incorporar al proveedor al listado provisional mientras se realiza la evaluación.',
        responsable_id: null,
        estado: EstadoNC.ABIERTA,
        createdAt: new Date('2026-08-26T11:30:00Z'),
      },

      // Auditoría 25 000001 (interna CERRADA) — 2 NC
      {
        auditoriaCodigo: '25 000001',
        codigo: '1',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 5.3 (antigua)',
        requisito_incumplido: 'Instalaciones y condiciones ambientales',
        clasificacion: ClasificacionNC.MAYOR,
        hallazgo:
          'El laboratorio de presión registró variaciones de temperatura fuera del límite permitido en cinco turnos consecutivos.',
        evidencia: 'Hojas de registro ambiental del 2025-09-02 al 2025-09-06.',
        aceptada_oec: true,
        reiterada: false,
        causa_raiz: 'Mal funcionamiento intermitente del sistema de climatización del laboratorio.',
        acciones_inmediatas: 'Reparar el aire acondicionado y suspender calibraciones de presión hasta estabilizar la temperatura.',
        plan_accion: {
          analisisExtension:
            'La NC cubre el control ambiental de los laboratorios de presión y masa.',
          obExtension: '',
          analisisCausa:
            'Falla del compresor del sistema HVAC que provoca oscilaciones térmicas.',
          obCausa: '',
          causaRaiz: 'Obsolescencia del compresor y ausencia de mantenimiento preventivo del HVAC.',
          correcciones: [
            {
              correccion: 'Reparación y mantenimiento correctivo del sistema de climatización.',
              evidencia: 'Orden de trabajo de mantenimiento MTTO-2025-112.',
              fecha: '2025-09-20',
              observaciones: 'Servicio realizado por proveedor acreditado.',
              ob: '',
            },
          ],
          accionesCorrectivas: [
            {
              accion: 'Plan de mantenimiento preventivo trimestral del HVAC de los laboratorios.',
              evidencia: 'Plan MTTO-PREV-2026 publicado y primer acta ejecutada.',
              fecha: '2025-10-15',
              observaciones: 'Ejecución verificada en visitas posteriores.',
              ob: '',
            },
          ],
        },
        verificacion_eficacia: {
          aprobado_por: 'Jefe del Departamento de Calidad',
          aprobado_por_id: null,
          fecha: '2025-10-20',
          resultado: 'EFICAZ',
          observaciones: 'Las condiciones ambientales se mantienen estables durante cuatro semanas consecutivas.',
        },
        responsable_id: null,
        estado: EstadoNC.CERRADA,
        fecha_cierre: new Date('2025-10-21'),
        createdAt: new Date('2025-09-10T09:00:00Z'),
      },
      {
        auditoriaCodigo: '25 000001',
        codigo: '2',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 5.6 (antigua)',
        requisito_incumplido: 'Trazabilidad de las mediciones',
        clasificacion: ClasificacionNC.CRITICA,
        hallazgo:
          'El patrón de referencia de masa presenta evidencia de daño en su superficie sin evaluación de impacto en la trazabilidad.',
        evidencia: 'Fotografías y ficha del patrón M-01 registradas el 2025-09-03.',
        aceptada_oec: true,
        reiterada: true,
        causa_raiz: 'Manipulación inadecuada del patrón por personal sin entrenamiento específico.',
        acciones_inmediatas: 'Aislar el patrón afectado, evaluar el desvío y coordinar recalibración.',
        plan_accion: {
          analisisExtension:
            'Aplica a todos los patrones de referencia con preservación de trazabilidad.',
          obExtension: '',
          analisisCausa:
            'Falta de instrucciones de manipulación y manejo visibles junto a los patrones.',
          obCausa: '',
          causaRaiz: 'Deficiente entrenamiento y señalización en el manejo de patrones de referencia.',
          correcciones: [
            {
              correccion: 'Recalibración del patrón M-01 y comprobación de desvíos dentro de tolerancia.',
              evidencia: 'Certificado de recalibración 2025 emitido por laboratorio acreditado.',
              fecha: '2025-09-25',
              observaciones: 'Desvío dentro de tolerancia; patrón habilitado.',
              ob: '',
            },
          ],
          accionesCorrectivas: [
            {
              accion:
                'Actualizar el procedimiento de manejo de patrones e impartir entrenamiento al personal técnico.',
              evidencia: 'Acta de entrenamiento y procedimiento PR-LM-001 Rev. 4.',
              fecha: '2025-10-10',
              observaciones: 'Todo el personal del laboratorio capacitado.',
              ob: '',
            },
          ],
        },
        verificacion_eficacia: {
          aprobado_por: 'Jefe del Departamento de Calidad',
          aprobado_por_id: null,
          fecha: '2025-10-18',
          resultado: 'EFICAZ',
          observaciones: 'No se repitieron incidencias de manipulación en el siguiente trimestre.',
        },
        responsable_id: null,
        estado: EstadoNC.VERIFICADA,
        createdAt: new Date('2025-09-10T10:00:00Z'),
      },
    ];

    for (const nc of ncs) {
      const auditoriaId = auditoriaIds[nc.auditoriaCodigo];
      if (!auditoriaId) continue;
      const { auditoriaCodigo, ...datos } = nc;
      const historial = this.historialNc(datos.estado, datos.createdAt ?? new Date());
      await this.prisma.noConformidad.upsert({
        where: { uq_no_conformidad_auditoria_codigo: { auditoria_id: auditoriaId, codigo: datos.codigo } },
        update: {},
        create: {
          ...datos,
          auditoria_id: auditoriaId,
          activo: true,
          historial: { create: historial },
        },
      });
    }

    // NO CONFORMIDADES independientes (auditoria_id = null).
    // Códigos altos (9001...) reservados para datos de ejemplo: quedan fuera
    // del rango de la secuencia real (1, 2, 3...) y no interfieren con los
    // generadores ni con datos existentes.
    const ncsIndependientes = [
      {
        codigo: '9001',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 8.9',
        clasificacion: ClasificacionNC.MENOR,
        hallazgo:
          'En la revisión por la dirección 2026 no se documenta el análisis de la retroalimentación del cliente.',
        evidencia: 'Minuta de revisión por la dirección de 2026-06-30.',
        causa_raiz: 'Plantilla de minuta sin casilla específica para la retroalimentación de clientes.',
        acciones_inmediatas: 'Registrar el análisis de retroalimentación del primer semestre.',
        plan_accion: {
          analisisExtension: '',
          obExtension: '',
          analisisCausa: '',
          obCausa: '',
          causaRaiz: '',
          correcciones: [],
          accionesCorrectivas: [
            {
              accion: 'Actualizar la plantilla de revisión por la dirección para incluir la retroalimentación del cliente.',
              evidencia: 'Plantilla Rev. 2 publicada en el SGC.',
              fecha: '2026-08-15',
              observaciones: '',
              ob: '',
            },
          ],
        },
        estado: EstadoNC.EN_CURSO,
        createdAt: new Date('2026-07-02T09:00:00Z'),
      },
      {
        codigo: '9002',
        categoria: 'NC',
        requisito: 'ISO/IEC 17025:2017, sección 7.7',
        clasificacion: ClasificacionNC.MENOR,
        hallazgo:
          'Los avisos de opiniones e interpretaciones no se incluyen en los informes de calibración conforme al procedimiento.',
        evidencia: 'Informe IN-2026-034 sin nota de opiniones e interpretaciones.',
        causa_raiz: 'Desconocimiento del personal sobre la aplicación de la cláusula 7.7.',
        acciones_inmediatas: 'Incluir inmediatamente la nota informativa en los informes pendientes.',
        estado: EstadoNC.ABIERTA,
        createdAt: new Date('2026-08-05T10:30:00Z'),
      },
    ];

    for (const nc of ncsIndependientes) {
      const existente = await this.prisma.noConformidad.findFirst({
        where: { auditoria_id: null, codigo: nc.codigo },
      });
      if (existente) continue;
      const historial = this.historialNc(nc.estado, nc.createdAt ?? new Date());
      await this.prisma.noConformidad.create({
        data: { ...nc, activo: true, historial: { create: historial } },
      });
    }

    // ==================== QUEJAS ====================
    const quejas = [
      {
        codigo: 'Q-0001',
        cliente: 'Laboratorio de Ensayos y Calibraciones LABCAL S.A.',
        telefono_contacto: '0991234567',
        email_contacto: 'cliente@labcal.com.ec',
        formulado_por: 'Ing. Verónica Cárdenas',
        descripcion_queja:
          'El certificado de calibración del manómetro digital referencia fue entregado con siete días de retraso respecto al plazo acordado.',
        recibida_por: 'Departamento de Recepción y Entrega',
        recibida_fecha: new Date('2026-09-03'),
        area_afectada: 'TECNICA',
        estado: EstadoQueja.RECIBIDA,
        observaciones: 'A la espera de la respuesta del área de calibración.',
        createdAt: new Date('2026-09-03T15:20:00Z'),
      },
      {
        codigo: 'Q-0002',
        cliente: 'Empresa Pública de Agua Quito',
        telefono_contacto: '022456789',
        email_contacto: 'servicios@epagua.gob.ec',
        formulado_por: 'Ab. Marcelo Andrade',
        descripcion_queja:
          'Dudas sobre el alcance de la calibración facturada para el conjunto de pesas de 5 kg: el informe no detalla los puntos calibrados.',
        recibida_por: 'Departamento de Recepción y Entrega',
        recibida_fecha: new Date('2026-07-22'),
        area_afectada: 'TECNICA',
        procedente: true,
        num_iac: 'IAC-2026-058',
        estado: EstadoQueja.EN_ANALISIS,
        responsables: [
          {
            fase: 'ANALISIS',
            nombre: 'Ing. Tobar Villacís Ana Cristina',
            cargo: 'Jefe de Calidad',
            fecha: new Date('2026-07-24'),
          },
        ],
        observaciones: 'Se confirmó que el informe omitió el detalle de puntos; se gestiona la corrección.',
        createdAt: new Date('2026-07-22T11:00:00Z'),
      },
      {
        codigo: 'Q-0003',
        cliente: 'Hospital Militar de Quito',
        telefono_contacto: '022554433',
        email_contacto: 'calidad@hmq.mil.ec',
        formulado_por: 'Tnte. Diego Herrera',
        descripcion_queja:
          'No se entregó la factura electrónica adjunta al reporte de calibración correspondiente a la orden OT-2026-009.',
        recibida_por: 'Departamento de Recepción y Entrega',
        recibida_fecha: new Date('2026-03-12'),
        area_afectada: 'ADMINISTRATIVA',
        procedente: true,
        num_iac: 'IAC-2026-015',
        acciones:
          'Se reenvió la factura electrónica al correo registrado y se notificó el procedimiento de facturación al área administrativa.',
        fecha_limite: new Date('2026-03-20'),
        verificacion_eficacia:
          'El cliente confirmó la recepción de la factura y la cancelación del servicio.',
        cierre_fecha: new Date('2026-03-25'),
        cerrada_por: 'Jefe del Departamento Administrativo',
        estado: EstadoQueja.CERRADA,
        responsables: [
          {
            fase: 'ANALISIS',
            nombre: 'Ing. Tobar Villacís Ana Cristina',
            cargo: 'Jefe de Calidad',
            fecha: new Date('2026-03-13'),
          },
          {
            fase: 'ACCIONES',
            nombre: 'Crnl. Andrade Cepeda Luis',
            cargo: 'Jefe del Departamento Administrativo',
            fecha: new Date('2026-03-15'),
          },
          {
            fase: 'CIERRE',
            nombre: 'Ing. Tobar Villacís Ana Cristina',
            cargo: 'Jefe de Calidad',
            fecha: new Date('2026-03-25'),
          },
        ],
        observaciones: 'Queja cerrada satisfactoriamente y cliente notificado.',
        createdAt: new Date('2026-03-12T10:30:00Z'),
      },
    ];

    for (const q of quejas) {
      const { responsables = [], ...datos } = q;
      await this.prisma.queja.upsert({
        where: { codigo: q.codigo },
        update: {},
        create: {
          ...datos,
          activo: true,
          responsables: {
            create: responsables.map((r: any) => ({
              fase: r.fase,
              nombre: r.nombre,
              cargo: r.cargo,
              fecha: r.fecha ? new Date(r.fecha) : null,
              createdAt: r.fecha ? new Date(r.fecha) : undefined,
            })),
          },
        },
      });
    }

    // ==================== RIESGOS Y OPORTUNIDADES ====================
    const riesgos: any[] = [
      {
        codigo: 'R-0001',
        tipo: TipoRiesgo.RIESGO,
        proceso: 'JDT_CALIBRACION',
        evento: 'Avería del patrón de referencia multímetro digital durante una campaña de calibración.',
        causa: 'Falta de mantenimiento preventivo y horas de operación acumuladas de los patrones.',
        fuente: 'Patrón de referencia MFD-02',
        consecuencias: 'Paralización de calibraciones eléctricas y retraso en la entrega de certificados.',
        probabilidad: 8,
        impacto: 7,
        deteccion: 5,
        nivel_riesgo: 280,
        condicion: 'ALTO',
        tratamiento: TratamientoRiesgo.REDUCIR,
        acciones:
          'Implementar mantenimiento preventivo trimestral de patrones y disponer de un patrón de respaldo calibrado.',
        fecha_limite: new Date('2026-08-30'),
        verificacion_eficacia: '',
        estado: EstadoRiesgo.EN_SEGUIMIENTO,
        observaciones: 'Patrón de respaldo adquirido; se verifica la eficacia al cierre del trimestre.',
        responsables: [
          { fase: 'IDENTIFICACION', nombre: 'Ing. Paredes Salazar Luis Fernando', cargo: 'Responsable Técnico', fecha: new Date('2026-01-15') },
          { fase: 'VALORACION', nombre: 'Ing. Tobar Villacís Ana Cristina', cargo: 'Jefe de Calidad', fecha: new Date('2026-01-20') },
          { fase: 'TRATAMIENTO', nombre: 'Crnl. Andrade Cepeda Luis', cargo: 'Jefe del Departamento Administrativo', fecha: new Date('2026-02-01') },
          { fase: 'SEGUIMIENTO', nombre: 'Ing. Tobar Villacís Ana Cristina', cargo: 'Jefe de Calidad', fecha: new Date('2026-09-01') },
        ],
        createdAt: new Date('2026-01-15T08:00:00Z'),
      },
      {
        codigo: 'R-0002',
        tipo: TipoRiesgo.RIESGO,
        proceso: 'RSEC',
        evento: 'Error en la facturación del servicio ante variaciones de tarifas publicadas.',
        causa: 'Tarifario desactualizado en el módulo de recepción.',
        fuente: 'Orden de trabajo / facturación',
        consecuencias: 'Reclamos de clientes y ajustes contables.',
        probabilidad: 5,
        impacto: 5,
        deteccion: 4,
        nivel_riesgo: 100,
        condicion: 'MODERADO',
        tratamiento: TratamientoRiesgo.REDUCIR,
        acciones: 'Revisión mensual del tarifario y validación automática previa a la emisión de facturas.',
        fecha_limite: new Date('2026-10-15'),
        estado: EstadoRiesgo.VALORADO,
        observaciones: 'En proceso de definición de la acción de tratamiento.',
        responsables: [
          { fase: 'IDENTIFICACION', nombre: 'Tnte. Roldán Jaramillo Pablo Andrés', cargo: 'Jefe de Recepción', fecha: new Date('2026-03-10') },
        ],
        createdAt: new Date('2026-03-10T09:00:00Z'),
      },
      {
        codigo: 'R-0003',
        tipo: TipoRiesgo.RIESGO,
        proceso: 'JDA',
        evento: 'Baja disponibilidad de repuestos críticos para equipos de calibración.',
        causa: 'Proveedores externos con plazos de entrega prolongados.',
        fuente: 'Bodega de insumos y repuestos',
        consecuencias: 'Mayores tiempos de inactividad de equipos por fallas.',
        probabilidad: 3,
        impacto: 3,
        deteccion: 5,
        nivel_riesgo: 45,
        condicion: 'LEVE',
        tratamiento: TratamientoRiesgo.ASUMIR,
        acciones: 'Mantener un stock mínimo de repuestos críticos y monitoreo trimestral del inventario.',
        fecha_limite: new Date('2026-06-15'),
        verificacion_eficacia: 'Stock mínimo implementado y sin desabastecimientos en el semestre.',
        cierre_fecha: new Date('2026-07-01'),
        cerrada_por: 'Jefe del Departamento Administrativo',
        estado: EstadoRiesgo.CERRADO,
        observaciones: 'Riesgo cerrado al verificarse la eficacia de las acciones.',
        responsables: [
          { fase: 'IDENTIFICACION', nombre: 'Crnl. Andrade Cepeda Luis', cargo: 'Jefe del Departamento Administrativo', fecha: new Date('2026-01-10') },
          { fase: 'SEGUIMIENTO', nombre: 'Crnl. Andrade Cepeda Luis', cargo: 'Jefe del Departamento Administrativo', fecha: new Date('2026-07-01') },
        ],
        createdAt: new Date('2026-01-10T08:30:00Z'),
      },
      {
        codigo: 'O-0001',
        tipo: TipoRiesgo.OPORTUNIDAD,
        proceso: 'JDC_DESEMPENO',
        evento: 'Autorización del servicio de calibración para nuevas magnitudes (temperatura y humedad).',
        causa: 'Se dispone de equipos patrones y personal capacitado para el montaje.',
        fuente: 'Demanda de clientes institucionales',
        consecuencias: 'Ampliación del alcance de acreditación y nuevos ingresos.',
        probabilidad: 6,
        impacto: 6,
        deteccion: 4,
        nivel_riesgo: 144,
        condicion: 'MODERADO',
        tratamiento: TratamientoRiesgo.ASUMIR,
        acciones:
          'Levantar los estudios de validación de los procedimientos y presentar la solicitud de ampliación al organismo de acreditación.',
        fecha_limite: new Date('2026-12-15'),
        verificacion_eficacia: '',
        estado: EstadoRiesgo.EN_SEGUIMIENTO,
        observaciones: 'Estudios de validación en elaboración por el laboratorio de temperatura.',
        responsables: [
          { fase: 'IDENTIFICACION', nombre: 'Ing. Tobar Villacís Ana Cristina', cargo: 'Jefe de Calidad', fecha: new Date('2026-04-05') },
          { fase: 'TRATAMIENTO', nombre: 'Ing. Paredes Salazar Luis Fernando', cargo: 'Responsable Técnico', fecha: new Date('2026-05-01') },
        ],
        createdAt: new Date('2026-04-05T10:00:00Z'),
      },
      {
        codigo: 'O-0002',
        tipo: TipoRiesgo.OPORTUNIDAD,
        proceso: 'DCM',
        evento: 'Digitalización del proceso de recepción para consulta de estado de equipos en línea.',
        causa: 'Mejora tecnológica propuesta desde la Dirección.',
        fuente: 'Proyecto de transformación digital',
        consecuencias: 'Mejora de la comunicación con el cliente y reducción de consultas telefónicas.',
        probabilidad: 4,
        impacto: 4,
        deteccion: 3,
        nivel_riesgo: 48,
        condicion: 'LEVE',
        tratamiento: TratamientoRiesgo.REDUCIR,
        acciones: 'Implementar el módulo de consulta de estado de equipos en el portal del cliente.',
        estado: EstadoRiesgo.IDENTIFICADO,
        observaciones: 'Oportunidad identificada; no se ha iniciado el estudio de factibilidad.',
        responsables: [
          { fase: 'IDENTIFICACION', nombre: 'May. Garzón Muñoz Marcelo Javier', cargo: 'Director del CMEE', fecha: new Date('2026-08-10') },
        ],
        createdAt: new Date('2026-08-10T09:00:00Z'),
      },
    ];

    for (const r of riesgos) {
      const { responsables = [], ...datos } = r;
      await this.prisma.riesgoOportunidad.upsert({
        where: { codigo: r.codigo },
        update: {},
        create: {
          ...datos,
          activo: true,
          responsables: {
            create: responsables.map((resp: any) => ({
              fase: resp.fase,
              nombre: resp.nombre,
              cargo: resp.cargo,
              fecha: resp.fecha ? new Date(resp.fecha) : null,
              createdAt: resp.fecha ? new Date(resp.fecha) : undefined,
            })),
          },
        },
      });
    }

    this.logger.log(
      `Datos de ejemplo de Calidad sincronizados: ${auditorias.length} auditorías, ${ncs.length + ncsIndependientes.length} no conformidades, ${quejas.length} quejas, ${riesgos.length} riesgos/oportunidades.`,
    );
  }

  /**
   * Construye el historial de estados de una NC sembrada según su estado final,
   * respetando la máquina de estados del servicio (ABIERTA → EN_CURSO →
   * VERIFICADA → CERRADA). realizado_por_id se deja null (es opcional).
   */
  private historialNc(estado: EstadoNC, base: Date) {
    const entradas: any[] = [
      { estado_anterior: null, estado_nuevo: EstadoNC.ABIERTA, accion: 'CREACION', observaciones: 'No conformidad registrada', realizado_por_id: null, createdAt: base },
    ];
    if (estado === EstadoNC.EN_CURSO || estado === EstadoNC.VERIFICADA || estado === EstadoNC.CERRADA) {
      entradas.push({
        estado_anterior: EstadoNC.ABIERTA,
        estado_nuevo: EstadoNC.EN_CURSO,
        accion: 'ESTADO',
        observaciones: 'Plan de acción registrado',
        realizado_por_id: null,
        createdAt: new Date(base.getTime() + 1 * 86400000),
      });
    }
    if (estado === EstadoNC.VERIFICADA || estado === EstadoNC.CERRADA) {
      entradas.push({
        estado_anterior: EstadoNC.EN_CURSO,
        estado_nuevo: EstadoNC.VERIFICADA,
        accion: 'ESTADO',
        observaciones: 'Eficacia de las acciones verificada',
        realizado_por_id: null,
        createdAt: new Date(base.getTime() + 5 * 86400000),
      });
    }
    if (estado === EstadoNC.CERRADA) {
      entradas.push({
        estado_anterior: EstadoNC.VERIFICADA,
        estado_nuevo: EstadoNC.CERRADA,
        accion: 'ESTADO',
        observaciones: 'No conformidad cerrada',
        realizado_por_id: null,
        createdAt: new Date(base.getTime() + 6 * 86400000),
      });
    }
    return entradas;
  }
}