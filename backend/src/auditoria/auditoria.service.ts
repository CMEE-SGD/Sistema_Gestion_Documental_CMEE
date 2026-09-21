import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FindAuditoriaDto } from './dto/find-auditoria.dto';
import { FindIntentosLoginDto } from './dto/find-intentos-login.dto';

/** Módulo controlador o servicio para gestionar la entidad Auditoria. */
@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio registrarLog.
   * @param data - Datos o identificador requerido (Objeto complejo / PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async registrarLog(data: {
    usuario_id: number;
    puesto_actor?: string | null;
    laboratorio_actor_id?: number | null;
    modulo: string;
    accion: string;
    descripcion?: string;
    detalle?: string | null;
    documento_id?: number;
    persona_afectada_id?: number;
    rol_afectado_id?: number;
    puesto_afectado_id?: number;
    entidad_id?: number | null;
  }) {
    return this.prisma.auditoria.create({
      data,
    });
  }

  /**
   * Lista la bitácora global con filtros y paginación reales — la tabla
   * crece sin límite, así que traerla completa en cada consulta no escala.
   */
  async findAll(filtros: FindAuditoriaDto) {
    const pagina = filtros.pagina ?? 1;
    const porPagina = filtros.porPagina ?? 20;

    const where: Prisma.AuditoriaWhereInput = {
      ...(filtros.modulo ? { modulo: filtros.modulo } : {}),
      ...(filtros.entidadId ? { entidad_id: filtros.entidadId } : {}),
      ...(filtros.accion ? { accion: { contains: filtros.accion } } : {}),
      ...(filtros.usuario
        ? {
            usuario: {
              nombre_usuario: {
                contains: filtros.usuario,
                mode: 'insensitive',
              },
            },
          }
        : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha_hora: {
              ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
              ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditoria.findMany({
        where,
        orderBy: { fecha_hora: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        include: {
          usuario: {
            select: {
              nombre_usuario: true,
              persona: { select: { nombre: true, apellidos: true } },
            },
          },
        },
      }),
      this.prisma.auditoria.count({ where }),
    ]);

    // Mismo criterio que findByDocumento/findByPersona/etc: resuelve el
    // nombre real de la entidad afectada, limpia el "#id" crudo de la
    // descripción guardada, y arma el nombre completo del usuario.
    await this.enriquecerConNombres(data);
    // Reemplaza los ids de llaves foráneas del detalle por sus nombres.
    await this.adjuntarNombresAlDetalle(data);

    return {
      data,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    };
  }

  /** Nombres de los campos FK más comunes en los payloads → tabla destino. */
  private readonly FKsDetalle: Record<string, string> = {
    tecnico_id: 'persona',
    responsable_id: 'persona',
    persona_id: 'persona',
    firmante_id: 'persona',
    recibe_responsable_id: 'persona',
    usuario_id: 'usuario',
    rol_id: 'rol',
    puesto_id: 'puesto',
    grupo_id: 'grupo',
    aplicacion_id: 'aplicacion',
    laboratorio_id: 'laboratorio',
    servicio_id: 'servicio',
    equipo_recepcion_id: 'equipo_recepcion',
    circuito_id: 'circuito',
    carpeta_id: 'carpeta',
    departamento_id: 'departamento',
    documento_id: 'documento',
    cliente_id: 'cliente_institucional',
    equipo_id: 'equipo',
    fase_id: 'fase',
    orden_trabajo_id: 'orden_trabajo',
  };

  /** True si el valor es un id numérico (número o string numérico "3"). */
  private esIdNumerico(valor: unknown): boolean {
    if (typeof valor === 'number') return Number.isInteger(valor);
    if (typeof valor === 'string' && valor.trim() !== '') {
      return Number.isInteger(Number(valor));
    }
    return false;
  }

  /**
   * Reescribe el `detalle` (JSON del payload) para que las llaves foráneas
   * muestren el nombre en vez del id. Ej: `{ "tecnico_id": 2 }` →
   * `{ "tecnico": "Juan Pérez" }`. Recorre objetos y arreglos anidados.
   */
  private async adjuntarNombresAlDetalle(filas: any[]) {
    const idsPorTabla = new Map<string, Set<number>>();
    const recolectar = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(recolectar);
        return;
      }
      for (const [campo, valor] of Object.entries(obj)) {
        if (valor !== null && typeof valor === 'object') {
          recolectar(valor);
          continue;
        }
        const tabla = this.FKsDetalle[campo];
        if (tabla && this.esIdNumerico(valor)) {
          if (!idsPorTabla.has(tabla)) idsPorTabla.set(tabla, new Set());
          idsPorTabla.get(tabla)!.add(Number(valor));
        }
      }
    };

    for (const fila of filas) {
      if (!fila?.detalle) continue;
      try {
        const parsed = JSON.parse(fila.detalle);
        if (parsed && typeof parsed === 'object') recolectar(parsed);
      } catch {
        /* detalle no es JSON: se deja como está */
      }
    }

    const nombresPorTabla = new Map<string, Map<number, string>>();
    for (const [tabla, ids] of idsPorTabla) {
      nombresPorTabla.set(
        tabla,
        await this.resolverNombresPorTabla(tabla, [...ids]),
      );
    }

    const renombrar = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(renombrar);
      if (!obj || typeof obj !== 'object') return obj;
      const resultado: Record<string, unknown> = {};
      for (const [campo, valor] of Object.entries(obj)) {
        if (valor !== null && typeof valor === 'object') {
          resultado[campo] = renombrar(valor);
          continue;
        }
        const tabla = this.FKsDetalle[campo];
        const nombre =
          tabla && this.esIdNumerico(valor)
            ? nombresPorTabla.get(tabla)?.get(Number(valor))
            : undefined;
        if (nombre) {
          resultado[campo.replace(/_id$/, '')] = nombre;
        } else {
          resultado[campo] = valor;
        }
      }
      return resultado;
    };

    for (const fila of filas) {
      if (!fila?.detalle) continue;
      try {
        const parsed = JSON.parse(fila.detalle);
        if (!parsed || typeof parsed !== 'object') continue;
        const nuevo = renombrar(parsed);
        if (JSON.stringify(nuevo) !== JSON.stringify(parsed)) {
          fila.detalle = JSON.stringify(nuevo);
        }
      } catch {
        /* detalle no es JSON: se deja como está */
      }
    }
  }

  /** Resuelve el nombre representativo de un registro según su tabla. */
  private async resolverNombresPorTabla(
    tabla: string,
    ids: number[],
  ): Promise<Map<number, string>> {
    const mapa = new Map<number, string>();

    switch (tabla) {
      case 'persona':
        for (const { id, nombre, apellidos } of await this.prisma.persona.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true, apellidos: true } },
        )) {
          mapa.set(id, `${nombre} ${apellidos ?? ''}`.trim());
        }
        break;
      case 'usuario':
        for (const { id, nombre_usuario } of await this.prisma.usuario.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre_usuario: true } },
        )) {
          mapa.set(id, nombre_usuario);
        }
        break;
      case 'rol':
        for (const { id, nombre } of await this.prisma.rol.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'puesto':
        for (const { id, nombre } of await this.prisma.puesto.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'grupo':
        for (const { id, nombre } of await this.prisma.grupo.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'aplicacion':
        for (const { id, nombre } of await this.prisma.aplicacion.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'laboratorio':
        for (const { id, nombre } of await this.prisma.laboratorio.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'servicio':
        for (const { id, nombre } of await this.prisma.servicio.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          if (nombre) mapa.set(id, nombre);
        }
        break;
      case 'equipo_recepcion':
        for (const { id, equipo_descripcion } of await this.prisma.equipoRecepcion.findMany(
          { where: { id: { in: ids } }, select: { id: true, equipo_descripcion: true } },
        )) {
          mapa.set(id, equipo_descripcion);
        }
        break;
      case 'circuito':
        for (const { id, nombre } of await this.prisma.circuito.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'carpeta':
        for (const { id, nombre } of await this.prisma.carpeta.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'departamento':
        for (const { id, nombre } of await this.prisma.departamento.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'documento':
        for (const { id, nombre, codigo } of await this.prisma.documento.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true, codigo: true } },
        )) {
          mapa.set(id, nombre.trim() || codigo?.trim() || null);
        }
        break;
      case 'equipo':
        for (const { id, nombre } of await this.prisma.equipo.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'fase':
        for (const { id, nombre } of await this.prisma.fase.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      case 'orden_trabajo':
        for (const { id, orden_trabajo_fisica } of await this.prisma.ordenTrabajo.findMany(
          { where: { id: { in: ids } }, select: { id: true, orden_trabajo_fisica: true } },
        )) {
          mapa.set(id, `OT ${orden_trabajo_fisica}`);
        }
        break;
      case 'cliente_institucional':
        for (const { id, nombre } of await this.prisma.clienteInstitucional.findMany(
          { where: { id: { in: ids } }, select: { id: true, nombre: true } },
        )) {
          mapa.set(id, nombre);
        }
        break;
      default:
        break;
    }

    return mapa;
  }

  /**
   * Resuelve el nombre legible de la entidad afectada por cada registro de
   * auditoría (`entidad_id` es polimórfico; la tabla depende del módulo).
   * Agrupa por módulo y consulta por lotes (evita N+1).
   */
  private async adjuntarNombreEntidad(filas: any[]) {
    const idsPorModulo = new Map<string, number[]>();
    for (const fila of filas) {
      if (!fila?.entidad_id) continue;
      const modulo = fila.modulo as string;
      if (!idsPorModulo.has(modulo)) idsPorModulo.set(modulo, []);
      idsPorModulo.get(modulo)!.push(fila.entidad_id as number);
    }

    const nombresPorModulo = new Map<string, Map<number, string>>();
    for (const [modulo, ids] of idsPorModulo) {
      nombresPorModulo.set(modulo, await this.resolverNombres(modulo, ids));
    }

    for (const fila of filas) {
      if (!fila?.entidad_id) continue;
      const nombres = nombresPorModulo.get(fila.modulo as string);
      fila.entidad_nombre = nombres?.get(fila.entidad_id as number) ?? null;
    }
  }

  /** Consulta por lote el nombre representativo de cada módulo. */
  private async resolverNombres(
    modulo: string,
    ids: number[],
  ): Promise<Map<number, string>> {
    const mapa = new Map<number, string>();

    switch (modulo) {
      case 'ACCESOS':
      case 'USUARIOS':
        for (const { id, nombre_usuario } of await this.prisma.usuario.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre_usuario: true },
        })) {
          mapa.set(id, nombre_usuario);
        }
        break;
      case 'PERSONAS':
        for (const { id, nombre, apellidos } of await this.prisma.persona.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true, apellidos: true },
        })) {
          mapa.set(id, `${nombre} ${apellidos ?? ''}`.trim());
        }
        break;
      case 'ROLES':
        for (const { id, nombre } of await this.prisma.rol.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'PUESTOS':
        for (const { id, nombre } of await this.prisma.puesto.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'GRUPOS':
        for (const { id, nombre } of await this.prisma.grupo.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'APLICACIONES':
        for (const { id, nombre } of await this.prisma.aplicacion.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'DEPARTAMENTOS':
        for (const { id, nombre } of await this.prisma.departamento.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'LABORATORIOS':
        for (const { id, nombre } of await this.prisma.laboratorio.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'EQUIPOS':
        for (const { id, nombre } of await this.prisma.equipo.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'SERVICIOS':
        for (const { id, nombre } of await this.prisma.servicio.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          if (nombre) mapa.set(id, nombre);
        }
        break;
      case 'CLIENTES-INSTITUCIONALES':
        for (const { id, nombre } of await this.prisma.clienteInstitucional.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'DOCUMENTOS': {
        // El cliente pidió ver DÓNDE está el documento, no solo su nombre
        // suelto — varios documentos/carpetas en ramas distintas del árbol
        // pueden compartir nombre genérico (ej. "2026", "Archivado"). Se
        // arma la ruta completa de carpetas hasta la raíz y se le agrega
        // el nombre del documento al final.
        const documentos = await this.prisma.documento.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true, codigo: true, carpeta_id: true },
        });
        if (documentos.length > 0) {
          const mapaCarpetas = await this.obtenerMapaCarpetas();
          for (const { id, nombre, codigo, carpeta_id } of documentos) {
            const nombreDoc = nombre?.trim() || codigo?.trim() || null;
            if (!nombreDoc) continue;
            const ruta = this.construirRutaCarpeta(carpeta_id, mapaCarpetas);
            mapa.set(id, ruta ? `${ruta} / ${nombreDoc}` : nombreDoc);
          }
        }
        break;
      }
      case 'CARPETAS': {
        const mapaCarpetas = await this.obtenerMapaCarpetas();
        for (const id of ids) {
          const ruta = this.construirRutaCarpeta(id, mapaCarpetas);
          if (ruta) mapa.set(id, ruta);
        }
        break;
      }
      case 'CIRCUITOS':
        for (const { id, nombre } of await this.prisma.circuito.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombre: true },
        })) {
          mapa.set(id, nombre);
        }
        break;
      case 'RECEPCION-EQUIPOS':
        for (const { id, equipo_descripcion } of await this.prisma.equipoRecepcion.findMany({
          where: { id: { in: ids } },
          select: { id: true, equipo_descripcion: true },
        })) {
          mapa.set(id, equipo_descripcion);
        }
        break;
      case 'CERTIFICADOS':
        for (const { id, numero_certificado } of await this.prisma.certificado.findMany({
          where: { id: { in: ids } },
          select: { id: true, numero_certificado: true },
        })) {
          mapa.set(id, `Certificado Nº ${numero_certificado}`);
        }
        break;
      case 'NOTIFICACIONES':
        for (const { id, mensaje } of await this.prisma.notificacion.findMany({
          where: { id: { in: ids } },
          select: { id: true, mensaje: true },
        })) {
          mapa.set(id, mensaje);
        }
        break;
      default:
        break;
    }

    return mapa;
  }

  /**
   * Todas las carpetas en un mapa id→{nombre, padre} — el árbol de Gestor
   * Documental es chico (decenas/cientos de carpetas), así que traerlo
   * completo de una sola consulta sale más barato que ir subiendo nivel por
   * nivel con una consulta por cada uno.
   */
  private async obtenerMapaCarpetas(): Promise<
    Map<number, { nombre: string; carpeta_padre_id: number | null }>
  > {
    const carpetas = await this.prisma.carpeta.findMany({
      select: { id: true, nombre: true, carpeta_padre_id: true },
    });
    return new Map(carpetas.map((c) => [c.id, c]));
  }

  /**
   * Arma la ruta completa de una carpeta subiendo por carpeta_padre_id
   * (ej. "Calidad / Archivado / 2026") — el cliente pidió ver DÓNDE está
   * ubicada la carpeta/documento, no solo su nombre suelto: varias carpetas
   * en ramas distintas del árbol pueden compartir un nombre genérico como
   * "2026" o "Archivado".
   */
  private construirRutaCarpeta(
    carpetaId: number | null | undefined,
    mapaCarpetas: Map<number, { nombre: string; carpeta_padre_id: number | null }>,
  ): string | null {
    if (carpetaId == null) return null;
    const partes: string[] = [];
    let actual: number | null = carpetaId;
    let saltos = 0;
    // Límite defensivo: una jerarquía real nunca tiene 20 niveles, esto solo
    // evita un bucle infinito si algún dato quedara mal enlazado en círculo.
    while (actual != null && saltos < 20) {
      const carpeta = mapaCarpetas.get(actual);
      if (!carpeta) break;
      partes.unshift(carpeta.nombre);
      actual = carpeta.carpeta_padre_id;
      saltos += 1;
    }
    return partes.length ? partes.join(' / ') : null;
  }

  /**
   * Lista la bitácora de intentos de inicio de sesión (éxitos y fallos),
   * con filtros y paginación reales — igual que findAll.
   */
  async findIntentosLogin(filtros: FindIntentosLoginDto) {
    const pagina = filtros.pagina ?? 1;
    const porPagina = filtros.porPagina ?? 20;

    const where: Prisma.IntentoLoginWhereInput = {
      ...(filtros.usuario
        ? {
            nombre_usuario: {
              contains: filtros.usuario,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filtros.exito !== undefined ? { exito: filtros.exito } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha_hora: {
              ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
              ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.intentoLogin.findMany({
        where,
        orderBy: { fecha_hora: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      this.prisma.intentoLogin.count({ where }),
    ]);

    return {
      data,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    };
  }

  /**
   * Ejecuta la operación de negocio findByPersona.
   * @param personaId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByPersona(personaId: number) {
    const data = await this.prisma.auditoria.findMany({
      where: { persona_afectada_id: personaId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true, persona: { select: { nombre: true, apellidos: true } } } } },
    });
    await this.enriquecerConNombres(data);
    return data;
  }

  /**
   * Ejecuta la operación de negocio findByDocumento.
   * @param documentoId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByDocumento(documentoId: number) {
    const data = await this.prisma.auditoria.findMany({
      where: { documento_id: documentoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true, persona: { select: { nombre: true, apellidos: true } } } } },
    });
    await this.enriquecerConNombres(data);
    return data;
  }

  /**
   * Ejecuta la operación de negocio findByRol.
   * @param rolId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByRol(rolId: number) {
    const data = await this.prisma.auditoria.findMany({
      where: { rol_afectado_id: rolId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true, persona: { select: { nombre: true, apellidos: true } } } } },
    });
    await this.enriquecerConNombres(data);
    return data;
  }

  /**
   * Ejecuta la operación de negocio findByPuesto.
   * @param puestoId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByPuesto(puestoId: number) {
    const data = await this.prisma.auditoria.findMany({
      where: { puesto_afectado_id: puestoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true, persona: { select: { nombre: true, apellidos: true } } } } },
    });
    await this.enriquecerConNombres(data);
    return data;
  }

  /**
   * Resuelve entidad_nombre (igual que ya hace findAll), limpia la
   * descripción guardada, y arma el nombre completo del usuario. La
   * descripción se arma en AuditoriaInterceptor con el id crudo ("Consulta
   * en Documentos #38") porque una consulta (GET) no manda body y ahí no
   * hay ningún nombre disponible. Acá sí se puede resolver consultando la
   * tabla real, así que se reemplaza el "#id" por el nombre resuelto — sin
   * tocar el texto ya guardado en BD, solo en la respuesta.
   */
  private async enriquecerConNombres(filas: any[]) {
    await this.adjuntarNombreEntidad(filas);

    // Nombres de laboratorio en lote (evita N+1) para las filas que traen
    // laboratorio_actor_id.
    const idsLaboratorio = [
      ...new Set(
        filas
          .map((f) => f.laboratorio_actor_id)
          .filter((id): id is number => id != null),
      ),
    ];
    const nombresLaboratorio = idsLaboratorio.length
      ? await this.prisma.laboratorio.findMany({
          where: { id: { in: idsLaboratorio } },
          select: { id: true, nombre: true },
        })
      : [];
    const mapaLaboratorio = new Map(nombresLaboratorio.map((l) => [l.id, l.nombre]));

    for (const fila of filas) {
      // Nombre y apellido de la persona (no solo el nombre_usuario de
      // login, ej. "jdc") — para que "quién lo hizo" sea legible.
      const persona = fila.usuario?.persona;
      fila.usuario_nombre_completo = persona
        ? `${persona.nombre} ${persona.apellidos ?? ''}`.trim()
        : null;

      fila.laboratorio_actor_nombre =
        fila.laboratorio_actor_id != null
          ? (mapaLaboratorio.get(fila.laboratorio_actor_id) ?? null)
          : null;

      if (!fila.descripcion || !fila.entidad_id || !fila.entidad_nombre) continue;

      // Regex con límite de palabra: "#3" con .replace() de texto plano
      // también hace match adentro de "#38" (substring), lo que corta mal
      // el número de OTRA fila con id de dos o más dígitos que comparte
      // prefijo. El "(?!\d)" exige que no siga otro dígito.
      const marcaIdRegex = new RegExp(`#${fila.entidad_id}(?!\\d)`);
      if (!marcaIdRegex.test(fila.descripcion)) continue;

      // En Carpetas/Documentos el destacado del payload (si lo hay) es
      // siempre el nombre suelto de la carpeta/documento — el cliente pidió
      // ver DÓNDE está ubicado, así que ahí se prefiere siempre la ruta
      // completa ya resuelta en entidad_nombre, tenga o no destacado.
      const prefiereRutaCompleta =
        fila.modulo === 'CARPETAS' || fila.modulo === 'DOCUMENTOS';

      if (fila.descripcion.includes(' — ')) {
        const marcaIdConEspacioRegex = new RegExp(` #${fila.entidad_id}(?!\\d)`);
        fila.descripcion = prefiereRutaCompleta
          ? fila.descripcion
              .replace(/ — .*/, ` — ${fila.entidad_nombre}`)
              .replace(marcaIdConEspacioRegex, '')
          : // Ya trae un destacado del payload (ej. de una Edición) — se
            // quita el id crudo y se deja el destacado, que puede ser más
            // específico que solo repetir el nombre de la entidad.
            fila.descripcion.replace(marcaIdConEspacioRegex, '');
      } else {
        // Sin destacado (ej. una Consulta) — el id se reemplaza por el
        // nombre real resuelto recién arriba.
        fila.descripcion = fila.descripcion.replace(
          marcaIdRegex,
          `— ${fila.entidad_nombre}`,
        );
      }
    }
  }
}
