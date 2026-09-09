const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EQUIPO_INCLUDE = {
  laboratorio: { select: { id: true, nombre: true, responsable_id: true } },
  sub_area: { select: { id: true, nombre: true } },
  tecnico: { select: { id: true, nombre: true, apellidos: true } },
  certificados: { select: { id: true } },
  historial_estado: {
    select: {
      id: true,
      estado_anterior: true,
      estado_nuevo: true,
      accion: true,
      observaciones: true,
      createdAt: true,
      realizado_por_id: true,
    },
    orderBy: { id: 'desc' },
    take: 5,
  },
  servicio: {
    select: { id: true, nombre: true, magnitud: true, laboratorio_id: true },
  },
  orden_trabajo: {
    select: {
      id: true,
      orden_trabajo_fisica: true,
      cliente: { select: { id: true, nombre: true, tipo: true } },
    },
  },
};

(async () => {
  try {
    // Encuentra un técnico real (puesto contiene "técnico") para simular
    const personas = await prisma.persona.findMany({
      where: { estado: 'ACTIVO' },
      select: { id: true, nombre: true, apellidos: true },
      take: 1,
    });
    console.log('tecnico candidato:', JSON.stringify(personas[0] ?? null));

    // 1) findOneEquipo(14)
    const antes = await prisma.equipoRecepcion.findUnique({
      where: { id: 14 },
      include: EQUIPO_INCLUDE,
    });
    if (!antes) {
      console.log('equipo 14 NO existe');
      return;
    }
    console.log('equipo 14 estado previo:', antes.estado);

    if (!personas[0]) {
      console.log('No hay técnicos reales para probar — prueba el update igual con el insight');
      return;
    }

    // 2) update() EXACTO del servicio
    const eq = await prisma.equipoRecepcion.update({
      where: { id: 14 },
      data: {
        tecnico_id: personas[0].id,
        estado: 'EN_CALIBRACION',
      },
      include: EQUIPO_INCLUDE,
    });
    console.log('UPDATE OK → estado:', eq.estado, 'tecnico:', eq.tecnico?.nombre);
  } catch (e) {
    console.error('ERROR:', e.message, '\n', e.meta ?? '');
  } finally {
    await prisma.$disconnect();
  }
})();