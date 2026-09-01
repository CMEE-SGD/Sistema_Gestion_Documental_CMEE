const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.$queryRawUnsafe(`SELECT count(*)::int AS n FROM intento_login`);
  console.log('total intentos:', total[0].n);
  const ultimos = await p.$queryRawUnsafe(
    `SELECT id, nombre_usuario, exito, ip, usuario_id, fecha_hora
     FROM intento_login ORDER BY fecha_hora DESC LIMIT 10`
  );
  console.log(JSON.stringify(ultimos, null, 2));
  const sesiones = await p.$queryRawUnsafe(
    `SELECT id, usuario_id, token_jti, ip, fecha_inicio, fecha_expiracion, fecha_cierre
     FROM sesion_activa ORDER BY id DESC LIMIT 10`
  );
  console.log('sesiones:', JSON.stringify(sesiones, null, 2));
  await p.$disconnect();
})();