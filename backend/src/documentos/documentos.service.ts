import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarpetasService } from '../carpetas/carpetas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import * as fs from 'fs';
import * as path from 'path';

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
      const carpeta = await this.prisma.carpeta.findUnique({ where: { id: actualId } });
      if (!carpeta) break;
      const nombreSeguro = carpeta.nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ -_]/g, '').trim();
      partes.unshift(nombreSeguro);
      actualId = carpeta.carpeta_padre_id;
    }

    // 👉 CAMBIO AQUÍ: Añadimos 'uploads' a la ruta principal
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
        },
      });

      await tx.documentoVersion.create({
        data: {
          documento_id: doc.id,
          version,
          archivo_url: urlParaBD,
          subido_por: data.propietario || null,
          comentario: null,
        },
      });

      const circuitoId = data.circuito_id ? parseInt(data.circuito_id, 10) : null;
      if (circuitoId) {
        const fases = await tx.fase.findMany({
          where: { circuito_id: circuitoId, activo: true },
          orderBy: { orden: 'asc' },
        });

        if (fases.length > 0) {
          const workflow = await tx.documentoWorkflow.create({
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

    if (!fs.existsSync(rutaDestinoAbsoluta)) {
      fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });
    }

    const nombreArchivo = file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreArchivo);
    fs.renameSync(file.path, rutaFisicaFinal);

    const urlParaBD = path.join(rutaDestinoRelativa, nombreArchivo).replace(/\\/g, '/');

    const ultimaVersion = await this.prisma.documentoVersion.findFirst({
      where: { documento_id: documentoId },
      orderBy: { created_at: 'desc' },
    });

    const nuevoNumero = ultimaVersion
      ? String(parseInt(ultimaVersion.version, 10) + 1)
      : '1';

    return this.prisma.$transaction(async (tx) => {
      const version = await tx.documentoVersion.create({
        data: {
          documento_id: documentoId,
          version: nuevoNumero,
          archivo_url: urlParaBD,
          subido_por: data.subido_por || null,
          comentario: data.comentario || null,
        },
      });

      await tx.documento.update({
        where: { id: documentoId },
        data: {
          archivo_url: urlParaBD,
          version: nuevoNumero,
        },
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
      data: {
        archivo_url: version.archivo_url,
        version: version.version,
      },
    });
  }

  async getWorkflow(documentoId: number) {
    const wf = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: {
        circuito: true,
        fases: {
          orderBy: { id: 'asc' },
          include: { fase: { include: { participantes: { include: { persona: { select: { id: true, nombre: true, apellidos: true } } } } } } },
        },
      },
    });
    if (!wf) return null;
    return wf;
  }

  async avanzarFase(file: Express.Multer.File, data: any) {
    const documentoId = parseInt(data.documento_id, 10);
    const doc = await this.prisma.documento.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    const workflow = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: { fases: { orderBy: { id: 'asc' } } },
    });
    if (!workflow) throw new NotFoundException('El documento no tiene un workflow activo');
    if (workflow.estado !== 'EN_CURSO') throw new BadRequestException('El workflow no está en curso');

    const faseActual = workflow.fases.find(f => f.estado === 'EN_CURSO');
    if (!faseActual) throw new BadRequestException('No hay una fase activa');

    const rutaDestinoRelativa = await this.obtenerRutaFisica(doc.carpeta_id);
    const rutaDestinoAbsoluta = path.resolve(process.cwd(), rutaDestinoRelativa);
    if (!fs.existsSync(rutaDestinoAbsoluta)) {
      fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });
    }

    const prefijo = `firma_${faseActual.id}_`;
    const nombreArchivo = prefijo + file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreArchivo);
    fs.renameSync(file.path, rutaFisicaFinal);

    const urlParaBD = path.join(rutaDestinoRelativa, nombreArchivo).replace(/\\/g, '/');

    return this.prisma.$transaction(async (tx) => {
      await tx.documentoWorkflowFase.update({
        where: { id: faseActual.id },
        data: {
          estado: 'COMPLETADO',
          archivo_url: urlParaBD,
          procesado_por: data.procesado_por || null,
          comentario: data.comentario || null,
        },
      });

      const idxActual = workflow.fases.findIndex(f => f.id === faseActual.id);
      const siguienteFase = workflow.fases[idxActual + 1];

      if (siguienteFase) {
        await tx.documentoWorkflowFase.update({
          where: { id: siguienteFase.id },
          data: { estado: 'EN_CURSO' },
        });

        const participantes = await tx.faseParticipante.findMany({
          where: { fase_id: siguienteFase.fase_id },
          select: { persona_id: true },
        });
        const documentoNombre = doc.nombre;
        for (const p of participantes) {
          await this.notificacionesService.crear(
            'workflow_avance',
            `Tienes un documento pendiente por revisar: "${documentoNombre}"`,
            p.persona_id,
            documentoId,
          );
        }
      } else {
        await tx.documentoWorkflow.update({
          where: { id: workflow.id },
          data: { estado: 'COMPLETADO' },
        });
      }

      return tx.documentoWorkflow.findUnique({
        where: { id: workflow.id },
        include: {
          circuito: true,
          fases: {
            orderBy: { id: 'asc' },
            include: { fase: { include: { participantes: { include: { persona: { select: { id: true, nombre: true, apellidos: true } } } } } } },
          },
        },
      });
    });
  }

  async rechazarFase(documentoId: number, data: any) {
    const workflow = await this.prisma.documentoWorkflow.findUnique({
      where: { documento_id: documentoId },
      include: { fases: { orderBy: { id: 'asc' } } },
    });
    if (!workflow) throw new NotFoundException('El documento no tiene un workflow activo');
    if (workflow.estado !== 'EN_CURSO') throw new BadRequestException('El workflow no está en curso');

    const faseActual = workflow.fases.find(f => f.estado === 'EN_CURSO');
    if (!faseActual) throw new BadRequestException('No hay una fase activa');

    const faseAnterior = [...workflow.fases].reverse().find(f => f.estado === 'COMPLETADO');

    return this.prisma.$transaction(async (tx) => {
      await tx.documentoWorkflowFase.update({
        where: { id: faseActual.id },
        data: {
          estado: 'RECHAZADO',
          procesado_por: data.procesado_por || null,
          comentario: data.comentario || null,
        },
      });

      if (faseAnterior) {
        await tx.documentoWorkflowFase.update({
          where: { id: faseAnterior.id },
          data: { estado: 'EN_CURSO' },
        });
      }

      return tx.documentoWorkflow.findUnique({
        where: { id: workflow.id },
        include: {
          circuito: true,
          fases: {
            orderBy: { id: 'asc' },
            include: { fase: { include: { participantes: { include: { persona: { select: { id: true, nombre: true, apellidos: true } } } } } } },
          },
        },
      });
    });
  }

  async findAll(carpetaId: number, usuarioId?: number) {
    if (usuarioId && carpetaId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, carpetaId, 1);
      if (!ok) throw new ForbiddenException('No tienes permiso para ver documentos en esta carpeta');
    }
    return this.prisma.documento.findMany({
      where: { carpeta_id: carpetaId },
      orderBy: { created_at: 'desc' },
      include: { circuito: true },
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
                include: {
                  fase: {
                    include: {
                      participantes: {
                        include: { persona: { select: { id: true, nombre: true, apellidos: true } } },
                      },
                    },
                  },
                },
              },
          },
        },
      },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (usuarioId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, doc.carpeta_id, 1);
      if (!ok) throw new ForbiddenException('No tienes permiso para ver este documento');
    }
    return doc;
  }

  async update(id: number, data: any, usuarioId?: number) {
    const documentoAntiguo = await this.prisma.documento.findUnique({ where: { id } });
    if (!documentoAntiguo) throw new NotFoundException('Documento no encontrado');

    if (usuarioId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, documentoAntiguo.carpeta_id, 3);
      if (!ok) throw new ForbiddenException('No tienes permiso para editar este documento');
    }

    if (data.carpeta_id && documentoAntiguo.carpeta_id !== data.carpeta_id) {
      if (usuarioId) {
        const puedeMover = await this.carpetasService.verificarNivelPermiso(usuarioId, documentoAntiguo.carpeta_id, 4);
        if (!puedeMover) throw new ForbiddenException('No tienes permiso para mover este documento');
      }
      const rutaAntiguaAbsoluta = path.resolve(process.cwd(), documentoAntiguo.archivo_url);
      const nuevaRutaRelativa = await this.obtenerRutaFisica(data.carpeta_id);
      const nuevaRutaAbsoluta = path.resolve(process.cwd(), nuevaRutaRelativa);
      
      if (!fs.existsSync(nuevaRutaAbsoluta)) fs.mkdirSync(nuevaRutaAbsoluta, { recursive: true });

      const nombreArchivo = path.basename(documentoAntiguo.archivo_url);
      const rutaFisicaFinal = path.join(nuevaRutaAbsoluta, nombreArchivo);

      if (fs.existsSync(rutaAntiguaAbsoluta)) {
        fs.renameSync(rutaAntiguaAbsoluta, rutaFisicaFinal);
        data.archivo_url = path.join(nuevaRutaRelativa, nombreArchivo).replace(/\\/g, '/');
      }
    }

    const updateData = { ...data };
    if (updateData.circuito_id !== undefined) {
      updateData.circuito_id = updateData.circuito_id ? parseInt(updateData.circuito_id, 10) : null;
    }
    return this.prisma.documento.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number, usuarioId?: number) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });

    if (!documento) throw new NotFoundException(`El documento con ID ${id} no existe.`);
    if (usuarioId) {
      const ok = await this.carpetasService.verificarNivelPermiso(usuarioId, documento.carpeta_id, 5);
      if (!ok) throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }

    const documentoEliminado = await this.prisma.documento.delete({
      where: { id },
    });

    if (documento.archivo_url) {
      const filePath = path.resolve(documento.archivo_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath); 
        } catch (error) {
          console.error(`Error al intentar eliminar el archivo físico: ${filePath}`, error);
        }
      }
    }

    return documentoEliminado;
  }
}