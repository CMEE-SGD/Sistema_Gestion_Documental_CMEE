import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarpetasService } from '../carpetas/carpetas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { verificarFirmaPdf } from '../common/helpers/pdf-signature';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentosService {
  constructor(
    private prisma: PrismaService,
    private carpetasService: CarpetasService,
    private notificacionesService: NotificacionesService,
  ) { }

  async obtenerRutaFisica(carpetaId: number): Promise<string> {
    const partes = [];
    let actualId: number | null = carpetaId;

    while (actualId) {
      const carpeta = await this.prisma.carpeta.findUnique({
        where: { id: actualId },
      });
      if (!carpeta) break;
      const nombreSeguro = carpeta.nombre
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ -_]/g, '')
        .trim();
      partes.unshift(nombreSeguro);
      actualId = carpeta.carpeta_padre_id;
    }

    return path.join('uploads', 'Gestor_Documental', ...partes);
  }

  async create(file: Express.Multer.File, data: any, usuarioId?: number) {
    const carpetaId = parseInt(data.carpeta_id, 10);

    if (usuarioId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { persona_id: true },
      });
      if (usuario?.persona_id) {
        const puestos = await this.prisma.personaPuesto.findMany({
          where: { persona_id: usuario.persona_id, activo: true },
          select: { departamento_id: true },
        });
        const deptosIds = puestos.map(p => p.departamento_id);
        const permiso = await this.prisma.carpetaPermiso.findFirst({
          where: {
            carpeta_id: carpetaId,
            OR: [
              { persona_id: usuario.persona_id },
              ...(deptosIds.length > 0 ? [{ departamento_id: { in: deptosIds } }] : []),
            ],
            permiso_docs: true,
          },
        });
        if (!permiso) {
          throw new ForbiddenException('No tienes permiso para crear documentos en esta carpeta');
        }
      }
    }

    const rutaDestinoRelativa = await this.obtenerRutaFisica(carpetaId);
    const rutaDestinoAbsoluta = path.resolve(process.cwd(), rutaDestinoRelativa);

    if (!fs.existsSync(rutaDestinoAbsoluta)) {
      fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });
    }

    const nombreArchivo = file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreArchivo);
    fs.renameSync(file.path, rutaFisicaFinal);

    const urlParaBD = path.join(rutaDestinoRelativa, nombreArchivo).replace(/\\/g, '/');
    const version = data.version || '1';
    const ahora = new Date();
    const fechaCreacion = data.created_at
      ? new Date(`${data.created_at}T${ahora.toTimeString().slice(0, 8)}`)
      : ahora;

    return this.prisma.$transaction(async (tx) => {
      const doc = await tx.documento.create({
        data: {
          archivo_url: urlParaBD,
          nombre: data.nombre,
          version,
          empresa: data.empresa,
          circuito_id: data.circuito_id ? parseInt(data.circuito_id, 10) : null,
          fecha_documento: data.fecha_documento ? new Date(data.fecha_documento) : null,
          activo: data.activo === 'true',
          propietario: data.propietario,
          carpeta_id: carpetaId,
          created_at: fechaCreacion,
        },
      });

      await tx.documentoVersion.create({
        data: {
          documento_id: doc.id,
          version,
          archivo_url: urlParaBD,
          subido_por: data.propietario || null,
          comentario: null,
          created_at: fechaCreacion,
        },
      });

      const circuitoId = data.circuito_id ? parseInt(data.circuito_id, 10) : null;
      if (circuitoId) {
        const fases = await tx.fase.findMany({
          where: { circuito_id: circuitoId, activo: true },
          orderBy: { orden: 'asc' },
        });

        if (fases.length > 0) {
          await tx.documentoWorkflow.create({
            data: {
              documento_id: doc.id,
              circuito_id: circuitoId,
              fases: {
                create: fases.map((f, i) => ({
                  fase_id: f.id,
                  estado: i === 0 ? 'EN_CURSO' : 'PENDIENTE',
                })),
              },
            },
          });
        }
      }
      return doc;
    });
  }

  getCircuitos() {
    return this.prisma.circuito.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });
  }

  async createVersion(file: Express.Multer.File, data: any) {
    const documentoId = parseInt(data.documento_id, 10);
    const doc = await this.prisma.documento.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException(`Documento con ID ${documentoId} no existe.`);

    const rutaDestinoRelativa = await this.obtenerRutaFisica(doc.carpeta_id);
    const rutaDestinoAbsoluta = path.resolve(process.cwd(), rutaDestinoRelativa);

    if (!fs.existsSync(rutaDestinoAbsoluta)) fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });

    const nombreArchivo = file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreArchivo);
    fs.renameSync(file.path, rutaFisicaFinal);

    const urlParaBD = path.join(rutaDestinoRelativa, nombreArchivo).replace(/\\/g, '/');
    const ultimaVersion = await this.prisma.documentoVersion.findFirst({
      where: { documento_id: documentoId },
      orderBy: { created_at: 'desc' },
    });
    const nuevoNumero = ultimaVersion ? String(parseInt(ultimaVersion.version, 10) + 1) : '1';

    return this.prisma.$transaction(async (tx) => {
      const ahora = new Date();
      const fechaCreacion = data.created_at
        ? new Date(`${data.created_at}T${ahora.toTimeString().slice(0, 8)}`)
        : ahora;

      const version = await tx.documentoVersion.create({
        data: {
          documento_id: documentoId,
          version: nuevoNumero,
          archivo_url: urlParaBD,
          subido_por: data.subido_por || null,
          comentario: data.comentario || null,
          created_at: fechaCreacion,
        },
      });

      await tx.documento.update({
        where: { id: documentoId },
        data: { archivo_url: urlParaBD, version: nuevoNumero },
      });
      return version;
    });
  }

  getVersiones(documentoId: number) {
    return this.prisma.documentoVersion.findMany({
      where: { documento_id: documentoId },
      orderBy: { created_at: 'desc' },
    });
  }

  async restaurarVersion(documentoId: number, versionId: number) {
    const version = await this.prisma.documentoVersion.findFirst({
      where: { id: versionId, documento_id: documentoId },
    });
    if (!version) throw new NotFoundException('Versión no encontrada');

    return this.prisma.documento.update({
      where: { id: documentoId },
      data: { archivo_url: version.archivo_url, version: version.version },
    });
  }

  async getWorkflow(documentoId: number) {
    const wf = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: {
        circuito: true,
        fases: {
          orderBy: { id: 'asc' },
          include: {
            fase: { include: { participantes: { include: { persona: { select: { id: true, nombre: true, apellidos: true } } } } } },
          },
        },
      },
    });
    return wf;
  }

  /** Resuelve la persona real asociada al usuario autenticado (nunca datos enviados por el cliente). */
  private async resolverPersonaId(user: HydratedUser): Promise<number> {
    if (user.isGod) return 1;
    let personaId = user.persona_id;
    if (!personaId && user.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: { persona_id: true },
      });
      personaId = usuario?.persona_id;
    }
    if (!personaId) {
      throw new ForbiddenException(
        'No se pudo determinar la persona asociada a este usuario',
      );
    }
    return personaId;
  }

  /** Lanza ForbiddenException si la persona no es participante asignado de la fase (cuando la fase sí tiene participantes definidos). */
  private async verificarParticipante(faseId: number, personaId: number, user: HydratedUser) {
    if (user.isGod) return;
    const totalParticipantes = await this.prisma.faseParticipante.count({ where: { fase_id: faseId } });
    if (totalParticipantes === 0) return; // Fase sin participantes definidos: cualquiera con acceso al módulo puede procesarla.
    const esParticipante = await this.prisma.faseParticipante.findFirst({
      where: { fase_id: faseId, persona_id: personaId },
    });
    if (!esParticipante) {
      throw new ForbiddenException('No eres uno de los participantes asignados a esta fase');
    }
  }

  /**
   * Firma digitalmente la fase activa del workflow con un PDF ya firmado en
   * el navegador del firmante (su .p12 personal) — la clave privada nunca
   * llega al servidor. Reemplaza el "avanzar fase" genérico: el firmante se
   * resuelve del usuario autenticado (no de lo que mande el cliente), se
   * valida que sea participante de la fase, y la firma se verifica
   * criptográficamente antes de aceptarla. El archivo del Documento se
   * actualiza en cada paso para que el siguiente firmante reciba
   * automáticamente el PDF con la firma anterior ya incluida.
   */
  async firmarFase(documentoId: number, file: Express.Multer.File, body: any, user: HydratedUser) {
    const doc = await this.prisma.documento.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    const workflow = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: { fases: { orderBy: { id: 'asc' } } },
    });
    if (!workflow || workflow.estado !== 'EN_CURSO') throw new BadRequestException('Workflow no válido');

    const faseActual = workflow.fases.find((f) => f.estado === 'EN_CURSO');
    if (!faseActual) throw new BadRequestException('No hay una fase activa');

    const personaId = await this.resolverPersonaId(user);
    await this.verificarParticipante(faseActual.fase_id, personaId, user);

    const pdfBuffer = await fs.promises.readFile(file.path);
    const resultado = verificarFirmaPdf(pdfBuffer);
    if (!resultado.valido || !resultado.certificado) {
      throw new BadRequestException(resultado.error || 'La firma digital del PDF no es válida');
    }
    const hashDocumento = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    const rutaDestinoRelativa = await this.obtenerRutaFisica(doc.carpeta_id);
    const rutaDestinoAbsoluta = path.resolve(process.cwd(), rutaDestinoRelativa);
    if (!fs.existsSync(rutaDestinoAbsoluta)) fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });

    // Conserva el nombre original del documento en uploads y sobrescribe el
    // mismo archivo físico en cada firma (eliminando la versión anterior),
    // en vez de ir creando ficheros acumulados tipo firma_<id>_...
    const nombreOriginal = doc.archivo_url ? path.basename(doc.archivo_url) : file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreOriginal);
    if (fs.existsSync(rutaFisicaFinal)) fs.unlinkSync(rutaFisicaFinal);
    fs.writeFileSync(rutaFisicaFinal, pdfBuffer);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    const urlParaBD = path.join(rutaDestinoRelativa, nombreOriginal).replace(/\\/g, '/');

    return this.prisma.$transaction(async (tx) => {
      // Solo la fase recién firmada conserva el archivo PDF. Se limpia el
      // archivo_url de las demás fases para que en la vista del documento
      // únicamente la firma actual muestre "Ver PDF"/"Descargar"; las fases
      // anteriores dejan de exponer el documento.
      await tx.documentoWorkflowFase.updateMany({
        where: { workflow_id: workflow.id, estado: { in: ['COMPLETADO', 'RECHAZADO'] } },
        data: { archivo_url: null },
      });
      await tx.documentoWorkflowFase.update({
        where: { id: faseActual.id },
        data: {
          estado: 'COMPLETADO',
          archivo_url: urlParaBD,
          procesado_por: resultado.certificado!.titular,
          comentario: body?.comentario?.trim() ? body.comentario.trim() : null,
        },
      });

      await tx.firmaDocumentoFase.create({
        data: {
          documento_workflow_fase_id: faseActual.id,
          firmante_id: personaId,
          certificado_titular: resultado.certificado!.titular,
          certificado_emisor: resultado.certificado!.emisor,
          certificado_numero_serie: resultado.certificado!.numeroSerie,
          certificado_valido_desde: resultado.certificado!.validoDesde,
          certificado_valido_hasta: resultado.certificado!.validoHasta,
          hash_documento: hashDocumento,
        },
      });

      // El archivo "actual" del documento avanza con cada firma, para que el
      // siguiente firmante reciba automáticamente el PDF ya co-firmado.
      const updateData: any = { archivo_url: urlParaBD };
      // El código NUNCA se regenera si ya existe: los sellos de fases
      // anteriores ya quedaron impresos en el PDF con su QR apuntando a ese
      // código — sobrescribirlo los dejaría todos apuntando a un código que
      // ya no existe en BD ("código no encontrado" al escanear un sello
      // viejo, aunque el documento siga siendo válido). Todas las fases de
      // un mismo documento comparten un único código de por vida, igual que
      // ya hace certificados.service.ts con técnico/jefe/director.
      if (doc.codigo_verificacion) {
        // no-op: se conserva el existente.
      } else if (body?.codigo_verificacion) {
        updateData.codigo_verificacion = body.codigo_verificacion as string;
      } else {
        updateData.codigo_verificacion = crypto.randomUUID();
      }
      await tx.documento.update({ where: { id: documentoId }, data: updateData });

      const idxActual = workflow.fases.findIndex((f) => f.id === faseActual.id);
      const siguienteFase = workflow.fases[idxActual + 1];

      if (siguienteFase) {
        await tx.documentoWorkflowFase.update({ where: { id: siguienteFase.id }, data: { estado: 'EN_CURSO' } });
        const participantes = await tx.faseParticipante.findMany({ where: { fase_id: siguienteFase.fase_id }, select: { persona_id: true } });
        for (const p of participantes) {
          await this.notificacionesService.crear('workflow_avance', `Revisión pendiente: "${doc.nombre}"`, p.persona_id, documentoId);
        }
      } else {
        await tx.documentoWorkflow.update({ where: { id: workflow.id }, data: { estado: 'COMPLETADO' } });
      }

      const docActualizado = await tx.documento.findUnique({ where: { id: documentoId }, select: { codigo_verificacion: true } });
      const result = await tx.documentoWorkflow.findUnique({ where: { id: workflow.id }, include: { circuito: true, fases: { orderBy: { id: 'asc' } } } });
      return { ...result, codigo_verificacion: docActualizado?.codigo_verificacion };
    });
  }

  async rechazarFase(documentoId: number, data: any, user: HydratedUser) {
    const workflow = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: { fases: { orderBy: { id: 'asc' } } },
    });    if (!workflow || workflow.estado !== 'EN_CURSO') throw new BadRequestException('Workflow no válido');

    const faseActual = workflow.fases.find((f) => f.estado === 'EN_CURSO');
    const faseAnterior = [...workflow.fases].reverse().find((f) => f.estado === 'COMPLETADO');

    const personaId = await this.resolverPersonaId(user);
    await this.verificarParticipante(faseActual.fase_id, personaId, user);

    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      select: { nombre: true, apellidos: true },
    });
    const nombreRechazante = persona ? `${persona.nombre} ${persona.apellidos}` : null;

    const doc = await this.prisma.documento.findUnique({ where: { id: documentoId } });

    return this.prisma.$transaction(async (tx) => {
      await tx.documentoWorkflowFase.update({
        where: { id: faseActual.id },
        data: { estado: 'RECHAZADO', procesado_por: nombreRechazante, comentario: data.comentario || null },
      });
      if (faseAnterior) {
        await tx.documentoWorkflowFase.update({ where: { id: faseAnterior.id }, data: { estado: 'EN_CURSO' } });
        const participantes = await tx.faseParticipante.findMany({ where: { fase_id: faseAnterior.fase_id }, select: { persona_id: true } });
        for (const p of participantes) {
          await this.notificacionesService.crear('workflow_avance', `Revisión rechazada: "${doc?.nombre}"`, p.persona_id, documentoId);
        }
      }
      return tx.documentoWorkflow.findUnique({ where: { id: workflow.id }, include: { circuito: true, fases: { orderBy: { id: 'asc' } } } });
    });
  }

  async findAll(carpetaId: number, usuarioId?: number) {
    if (usuarioId && carpetaId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, carpetaId, 1);
      if (!ok) throw new ForbiddenException('No tienes permiso de lectura');
    }
    return this.prisma.documento.findMany({
      where: { carpeta_id: carpetaId },
      orderBy: { created_at: 'desc' },
      include: { circuito: true },
      take: 500, // límite de seguridad: una carpeta no debería listar más que esto de golpe
    });
  }

  async findOne(id: number, usuarioId?: number) {
    const doc = await this.prisma.documento.findUnique({
      where: { id },
      include: {
        circuito: true,
        versiones: { orderBy: { created_at: 'desc' } },
        workflow: {
          include: {
            circuito: true,
            fases: {
              orderBy: { id: 'asc' },
              include: { fase: { include: { participantes: { include: { persona: { select: { id: true, nombre: true, apellidos: true } } } } } } },
            },
          },
        },
      },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (usuarioId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, doc.carpeta_id, 1);
      if (!ok) throw new ForbiddenException('Acceso denegado');
    }
    return doc;
  }

  /**
   * Descarga del archivo físico — antes se servía directo desde /uploads/
   * (archivo estático), sin pasar por ningún guard ni quedar registrado en
   * auditoría. Este endpoint sí queda capturado por AuditoriaInterceptor
   * (etiquetado "Descarga", ver la lógica de sub-acciones ahí) porque pasa
   * por el pipeline normal de NestJS.
   */
  async descargar(id: number, usuarioId?: number) {
    const doc = await this.findOne(id, usuarioId);
    if (!doc.archivo_url) {
      throw new NotFoundException('Este documento no tiene un archivo asociado');
    }
    const filePath = path.resolve(process.cwd(), doc.archivo_url);
    const nombreOriginal = path.basename(doc.archivo_url);
    return { filePath, nombreOriginal };
  }

  async update(id: number, data: any, usuarioId?: number) {
    const antiguo = await this.prisma.documento.findUnique({ where: { id } });
    if (!antiguo) throw new NotFoundException('Documento no encontrado');

    if (usuarioId) {
      if (!(await this.carpetasService.verificarNivelPermiso(usuarioId, antiguo.carpeta_id, 3))) throw new ForbiddenException('Sin permiso de edición');
    }

    if (data.carpeta_id && antiguo.carpeta_id !== data.carpeta_id) {
      if (usuarioId && !(await this.carpetasService.verificarNivelPermiso(usuarioId, antiguo.carpeta_id, 4))) throw new ForbiddenException('Sin permiso para mover');
      
      const rutaAntiguaAbsoluta = path.resolve(process.cwd(), antiguo.archivo_url);
      const nuevaRutaRelativa = await this.obtenerRutaFisica(data.carpeta_id);
      const nuevaRutaAbsoluta = path.resolve(process.cwd(), nuevaRutaRelativa);
      if (!fs.existsSync(nuevaRutaAbsoluta)) fs.mkdirSync(nuevaRutaAbsoluta, { recursive: true });
      const nombre = path.basename(antiguo.archivo_url);
      const destino = path.join(nuevaRutaAbsoluta, nombre);
      if (fs.existsSync(rutaAntiguaAbsoluta)) {
        fs.renameSync(rutaAntiguaAbsoluta, destino);
        data.archivo_url = path.join(nuevaRutaRelativa, nombre).replace(/\\/g, '/');
      }
    }
    const updateData: any = {
      nombre: data.nombre,
      codigo: data.codigo ?? null,
      propietario: data.propietario ?? null,
      empresa: data.empresa ?? null,
      fecha_documento: data.fecha_documento ? new Date(data.fecha_documento) : null,
      circuito_id: data.circuito_id ? parseInt(data.circuito_id, 10) : null,
      activo: data.activo,
      ...(data.created_at ? { created_at: new Date(`${data.created_at}T${new Date().toTimeString().slice(0, 8)}`) } : {}),
    };

    const nuevoCircuitoId = data.circuito_id ? parseInt(data.circuito_id, 10) : null;
    const cambioCircuito = (antiguo.circuito_id ?? null) !== nuevoCircuitoId;

    return this.prisma.$transaction(async (tx) => {
      const doc = await tx.documento.update({ where: { id }, data: updateData });

      if (data.created_at) {
        const fechaNueva = new Date(`${data.created_at}T${new Date().toTimeString().slice(0, 8)}`);
        await tx.documentoVersion.updateMany({ where: { documento_id: id }, data: { created_at: fechaNueva } });
      }

      if (cambioCircuito) {
        const workflowViejo = await tx.documentoWorkflow.findUnique({ where: { documento_id: id } });
        if (workflowViejo) {
          await tx.documentoWorkflowFase.deleteMany({ where: { workflow_id: workflowViejo.id } });
          await tx.documentoWorkflow.delete({ where: { id: workflowViejo.id } });
        }

        if (nuevoCircuitoId) {
          const fases = await tx.fase.findMany({
            where: { circuito_id: nuevoCircuitoId, activo: true },
            orderBy: { orden: 'asc' },
          });
          if (fases.length > 0) {
            await tx.documentoWorkflow.create({
              data: {
                documento_id: id,
                circuito_id: nuevoCircuitoId,
                fases: {
                  create: fases.map((f, i) => ({
                    fase_id: f.id,
                    estado: i === 0 ? 'EN_CURSO' : 'PENDIENTE',
                  })),
                },
              },
            });
          }
        }
      }

      return doc;
    });
  }

  async remove(id: number, usuarioId?: number) {
    const doc = await this.prisma.documento.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (usuarioId && !(await this.carpetasService.verificarNivelPermiso(usuarioId, doc.carpeta_id, 5))) throw new ForbiddenException('Sin permiso de eliminación');

    const eliminado = await this.prisma.documento.delete({ where: { id } });
    if (doc.archivo_url && fs.existsSync(path.resolve(doc.archivo_url))) fs.unlinkSync(path.resolve(doc.archivo_url));
    return eliminado;
  }

  async verificar(codigo: string) {
    const doc = await this.prisma.documento.findUnique({
      where: { codigo_verificacion: codigo },
      include: {
        workflow: {
          include: {
            fases: {
              orderBy: { id: 'asc' },
              include: {
                fase: { select: { nombre: true } },
                firmas: {
                  select: {
                    certificado_titular: true,
                    certificado_emisor: true,
                    certificado_numero_serie: true,
                    certificado_valido_desde: true,
                    certificado_valido_hasta: true,
                    hash_documento: true,
                    fecha_firma: true,
                    firmante: { select: { nombre: true, apellidos: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado o código inválido');

    const fases = doc.workflow?.fases ?? [];
    return {
      codigo_verificacion: doc.codigo_verificacion,
      nombre: doc.nombre,
      version: doc.version,
      fecha_documento: doc.fecha_documento,
      empresa: doc.empresa,
      estado_workflow: doc.workflow?.estado ?? null,
      firmas: fases.flatMap((f) =>
        f.firmas.map((firma) => ({
          firmante: `${firma.firmante.nombre} ${firma.firmante.apellidos}`,
          fase: f.fase?.nombre ?? null,
          fecha: firma.fecha_firma,
          certificado_titular: firma.certificado_titular,
          certificado_emisor: firma.certificado_emisor,
          certificado_numero_serie: firma.certificado_numero_serie,
        })),
      ),
    };
  }
}