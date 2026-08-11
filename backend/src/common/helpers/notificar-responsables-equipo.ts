import { EstadoRecepcion } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';

export interface EquipoParaNotificar {
  id: number;
  equipo_descripcion: string;
  laboratorio_id: number;
  tecnico_id: number | null;
}

interface CriterioRol {
  palabraClave: string;
  excluir?: string;
  alcanceLaboratorio: boolean;
}

/**
 * A quién notificar cuando un EquipoRecepcion llega a cada estado — mismo
 * criterio de roles (palabra clave sobre el nombre del puesto) que ya usan
 * recepcion-equipos.service.ts y certificados.service.ts para autorizar
 * quién puede actuar en cada paso, así que la notificación siempre llega a
 * alguien que realmente puede resolver el paso pendiente.
 */
const RESPONSABLES_POR_ESTADO: Partial<
  Record<EstadoRecepcion, 'tecnico' | CriterioRol[]>
> = {
  [EstadoRecepcion.EN_CALIBRACION]: 'tecnico',
  [EstadoRecepcion.REVISION_OBT]: [
    { palabraClave: 'observador', alcanceLaboratorio: true },
    { palabraClave: 'jefe', excluir: 'calidad', alcanceLaboratorio: true },
  ],
  [EstadoRecepcion.PENDIENTE_FIRMA_TECNICO]: 'tecnico',
  [EstadoRecepcion.REVISION_JEFE]: [
    { palabraClave: 'jefe', excluir: 'calidad', alcanceLaboratorio: true },
  ],
  [EstadoRecepcion.REVISION_DIRECTOR]: [
    { palabraClave: 'director', alcanceLaboratorio: false },
  ],
  [EstadoRecepcion.LISTO_PARA_ENTREGA]: [
    { palabraClave: 'responsable servicio al cliente', alcanceLaboratorio: false },
  ],
};

/**
 * Notifica a quien deba actuar a continuación tras un cambio de estado de un
 * EquipoRecepcion. La usan tanto el flujo de revisión previa
 * (recepcion-equipos.service.ts#transicionEstado) como el de firma digital
 * (certificados.service.ts#firmar), porque ambos avanzan la misma máquina de
 * estados (EquipoRecepcion.estado) y comparten exactamente los mismos roles.
 *
 * Nunca lanza: un fallo al resolver destinatarios o al crear la notificación
 * se registra en consola y no debe impedir ni revertir la transición de
 * estado que ya quedó confirmada en la base de datos — por eso siempre se
 * invoca después de que la transacción de la transición ya hizo commit.
 */
export async function notificarResponsablesEquipo(
  prisma: PrismaService,
  notificaciones: NotificacionesService,
  equipo: EquipoParaNotificar,
  estadoNuevo: EstadoRecepcion,
): Promise<void> {
  try {
    const criterio = RESPONSABLES_POR_ESTADO[estadoNuevo];
    if (!criterio) return;

    const mensaje = `Equipo "${equipo.equipo_descripcion}" pendiente de su revisión (${estadoNuevo}).`;

    if (criterio === 'tecnico') {
      if (equipo.tecnico_id) {
        await notificaciones.crear('recepcion_equipos', mensaje, equipo.tecnico_id, equipo.id);
      }
      return;
    }

    const personaIds = new Set<number>();
    for (const { palabraClave, excluir, alcanceLaboratorio } of criterio) {
      const asignaciones = await prisma.personaPuesto.findMany({
        where: {
          activo: true,
          puesto: { nombre: { contains: palabraClave, mode: 'insensitive' } },
          ...(excluir
            ? { NOT: { puesto: { nombre: { contains: excluir, mode: 'insensitive' } } } }
            : {}),
          ...(alcanceLaboratorio
            ? { departamento: { laboratorio_id: equipo.laboratorio_id } }
            : {}),
        },
        select: { persona_id: true },
      });
      asignaciones.forEach((a) => personaIds.add(a.persona_id));
    }

    for (const personaId of personaIds) {
      await notificaciones.crear('recepcion_equipos', mensaje, personaId, equipo.id);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      `[notificaciones] No se pudo notificar el avance del equipo ${equipo.id}:`,
      err,
    );
  }
}
