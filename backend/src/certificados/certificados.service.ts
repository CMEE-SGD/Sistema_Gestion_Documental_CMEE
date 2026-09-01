import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoRecepcion, EtapaFirma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { formatearNumeroCertificado } from '../common/helpers/certificado-format';
import { verificarFirmaPdf } from '../common/helpers/pdf-signature';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { notificarResponsablesEquipo } from '../common/helpers/notificar-responsables-equipo';

function conNumeroFormateado<
  T extends { numero_certificado: number; fecha_subida: Date },
>(certificado: T) {
  return {
    ...certificado,
    numero_certificado_formateado: formatearNumeroCertificado(
      certificado.numero_certificado,
      certificado.fecha_subida,
    ),
  };
}

@Injectable()
export class CertificadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async upload(
    file: Express.Multer.File,
    equipoRecepcionId: number,
    user: HydratedUser,
  ) {
    const equipo = await this.prisma.equipoRecepcion.findUnique({
      where: { id: equipoRecepcionId },
    });

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con ID ${equipoRecepcionId} no encontrado`,
      );
    }

    if (equipo.estado !== EstadoRecepcion.EN_CALIBRACION) {
      throw new BadRequestException(
        'El equipo no se encuentra en estado de calibración activa',
      );
    }

    const personaId = user.persona_id;
    const puesto = user.puesto ?? '';
    const labId: number | null = user.laboratorio_id ?? null;

    if (!user.isGod && !personaId) {
      throw new ForbiddenException(
        'No se pudo determinar la persona asociada a este usuario',
      );
    }

    if (!user.isGod) {
      const n = puesto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const esObservador = n.includes('observador');
      const esTecnico = n.includes('tecnico') && !n.includes('observador');

      if (esObservador && equipo.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos de otro laboratorio',
        );
      }

      if (esTecnico && equipo.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos que no te fueron asignados',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const certificado = await tx.certificado.create({
        data: {
          equipo_recepcion_id: equipoRecepcionId,
          ruta_archivo: file.path,
          nombre_original: file.originalname,
          tecnico_id: user.isGod ? 1 : personaId,
        },
      });

      await tx.equipoRecepcion.update({
        where: { id: equipoRecepcionId },
        data: { estado: EstadoRecepcion.REVISION_OBT },
      });

      await tx.historialEstado.create({
        data: {
          equipo_recepcion_id: equipoRecepcionId,
          estado_anterior: EstadoRecepcion.EN_CALIBRACION,
          estado_nuevo: EstadoRecepcion.REVISION_OBT,
          accion: 'APROBAR',
          realizado_por_id: personaId ?? 1,
        },
      });

      const creado = await tx.certificado.findUnique({
        where: { id: certificado.id },
        include: {
          equipo_recepcion: {
            select: {
              id: true,
              estado: true,
            },
          },
        },
      });

      return creado ? conNumeroFormateado(creado) : creado;
    });
  }

  /**
   * Firma digitalmente un certificado con un PDF ya firmado en el
   * navegador del firmante (con su .p12 personal) — la clave privada y la
   * contraseña del .p12 nunca llegan al servidor. Reemplaza el "Aprobar"
   * genérico para los tres pasos que realmente firman: técnico que calibró,
   * jefe de laboratorio y director. La firma se verifica criptográficamente
   * aquí; no se confía en que el cliente diga "ya firmé".
   */
  async firmar(
    certificadoId: number,
    file: Express.Multer.File,
    user: HydratedUser,
  ) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id: certificadoId },
      include: {
        equipo_recepcion: {
          select: {
            id: true,
            estado: true,
            tecnico_id: true,
            equipo_descripcion: true,
            laboratorio_id: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(
        `Certificado con ID ${certificadoId} no encontrado`,
      );
    }

    const equipo = certificado.equipo_recepcion;

    const personaId = user.persona_id;
    const puesto = user.puesto ?? '';

    if (!user.isGod && !personaId) {
      throw new ForbiddenException(
        'No se pudo determinar la persona asociada a este usuario',
      );
    }

    const n = Array.from(puesto.toLowerCase().normalize('NFD'))
      .filter((ch) => {
        const code = ch.codePointAt(0) ?? 0;
        return code < 0x0300 || code > 0x036f;
      })
      .join('');

    const esTecnico = n.includes('tecnico') && !n.includes('observador');
    // Excluye "calidad" — "Jefe Departamento Gestión de la Calidad" también
    // contiene "jefe" y no debe colar como Jefe de Laboratorio.
    const esJefe = n.includes('jefe') && !n.includes('calidad');
    const esDirector = n.includes('director');

    let etapa: EtapaFirma;
    let estadoNuevo: EstadoRecepcion;

    switch (equipo.estado) {
      case EstadoRecepcion.PENDIENTE_FIRMA_TECNICO:
        if (!user.isGod) {
          if (!esTecnico) {
            throw new ForbiddenException(
              'Solo el técnico asignado puede firmar en este paso',
            );
          }
          if (equipo.tecnico_id !== personaId) {
            throw new ForbiddenException(
              'No eres el técnico asignado a este equipo',
            );
          }
        }
        etapa = EtapaFirma.TECNICO;
        estadoNuevo = EstadoRecepcion.REVISION_JEFE;
        break;

      case EstadoRecepcion.REVISION_JEFE:
        if (!user.isGod && !esJefe) {
          throw new ForbiddenException(
            'Solo el Jefe de Laboratorio puede firmar en este paso',
          );
        }
        etapa = EtapaFirma.JEFE;
        estadoNuevo = EstadoRecepcion.REVISION_DIRECTOR;
        break;

      case EstadoRecepcion.REVISION_DIRECTOR:
        if (!user.isGod && !esDirector) {
          throw new ForbiddenException(
            'Solo el Director puede firmar en este paso',
          );
        }
        etapa = EtapaFirma.DIRECTOR;
        estadoNuevo = EstadoRecepcion.LISTO_PARA_ENTREGA;
        break;

      default:
        throw new BadRequestException(
          'Este equipo no se encuentra en un paso que requiera firma digital',
        );
    }

    const pdfBuffer = await fs.promises.readFile(file.path);
    const resultado = verificarFirmaPdf(pdfBuffer);

    if (!resultado.valido || !resultado.certificado) {
      throw new BadRequestException(
        resultado.error || 'La firma digital del PDF no es válida',
      );
    }

    const hashDocumento = crypto
      .createHash('sha256')
      .update(pdfBuffer)
      .digest('hex');
    const firmanteId = user.isGod ? 1 : (personaId as number);

    const resultadoFirma = await this.prisma.$transaction(async (tx) => {
      await tx.certificado.update({
        where: { id: certificadoId },
        data: { ruta_archivo: file.path, nombre_original: file.originalname },
      });

      const firma = await tx.firmaDigital.create({
        data: {
          certificado_id: certificadoId,
          firmante_id: firmanteId,
          etapa,
          certificado_titular: resultado.certificado!.titular,
          certificado_emisor: resultado.certificado!.emisor,
          certificado_numero_serie: resultado.certificado!.numeroSerie,
          certificado_valido_desde: resultado.certificado!.validoDesde,
          certificado_valido_hasta: resultado.certificado!.validoHasta,
          hash_documento: hashDocumento,
        },
      });

      await tx.equipoRecepcion.update({
        where: { id: equipo.id },
        data: { estado: estadoNuevo },
      });

      await tx.historialEstado.create({
        data: {
          equipo_recepcion_id: equipo.id,
          estado_anterior: equipo.estado,
          estado_nuevo: estadoNuevo,
          accion: 'APROBAR',
          observaciones: `Firmado digitalmente por ${resultado.certificado!.titular}`,
          realizado_por_id: firmanteId,
        },
      });

      return { firma, estado_nuevo: estadoNuevo };
    });

    // Se notifica después de que la transacción de la firma ya quedó
    // confirmada en BD — un fallo al notificar nunca debe revertir ni
    // bloquear la firma que ya se registró (ver notificarResponsablesEquipo,
    // que además nunca lanza).
    await notificarResponsablesEquipo(
      this.prisma,
      this.notificacionesService,
      {
        id: equipo.id,
        equipo_descripcion: equipo.equipo_descripcion,
        laboratorio_id: equipo.laboratorio_id,
        tecnico_id: equipo.tecnico_id,
      },
      estadoNuevo,
    );

    return resultadoFirma;
  }

  async download(id: number, user: HydratedUser) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        equipo_recepcion: {
          select: {
            id: true,
            tecnico_id: true,
            laboratorio_id: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    const equipo = certificado.equipo_recepcion;

    const personaId = user.persona_id;
    const puesto = user.puesto ?? '';
    const labId: number | null = user.laboratorio_id ?? null;

    if (!user.isGod) {
      const n = puesto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // Excluye "jefe" de esTecnico — un puesto como "Jefe Técnico de
      // Laboratorio" contiene "tecnico" en el texto, pero quien lo ocupa
      // revisa/firma certificados de CUALQUIER técnico del laboratorio, no
      // solo los que él mismo tuviera asignados (mismo criterio que ya usa
      // firmar() más arriba en este archivo para el paso REVISION_JEFE).
      // Sin esta exclusión, un Jefe con ese título quedaba bloqueado para
      // descargar certificados de equipos que no le fueron asignados a él.
      const esObservador = n.includes('observador');
      const esTecnico =
        n.includes('tecnico') && !n.includes('observador') && !n.includes('jefe');

      if (esObservador && equipo.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados de otro laboratorio',
        );
      }

      if (esTecnico && equipo.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados que no te fueron asignados',
        );
      }
    }

    return path.resolve(certificado.ruta_archivo);
  }

  /**
   * Verificación pública de autenticidad — sin autenticación. Devuelve solo
   * metadatos seguros (nunca la ruta del archivo ni datos personales más
   * allá del nombre del técnico responsable).
   *
   * El listado de `firmas` es la parte fiel al patrón de FirmaEC: su QR, al
   * escanearse, muestra únicamente el nombre del firmante y la fecha de esa
   * firma puntual — no un resumen general del trámite. Como un mismo
   * certificado pasa por 3 firmantes (técnico, jefe, director) que comparten
   * el mismo codigo_verificacion, aquí se listan las 3 firmas reales
   * registradas en FirmaDigital al momento de cada firma, en vez de mostrar
   * solo metadatos genéricos del certificado.
   */
  async verificar(codigo: string) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { codigo_verificacion: codigo },
      include: {
        equipo_recepcion: {
          select: { equipo_descripcion: true },
        },
        firmas: {
          orderBy: { fecha_firma: 'asc' },
          select: {
            etapa: true,
            certificado_titular: true,
            fecha_firma: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(
        'El código de verificación no corresponde a ningún certificado emitido',
      );
    }

    return {
      valido: true,
      numero_certificado: formatearNumeroCertificado(
        certificado.numero_certificado,
        certificado.fecha_subida,
      ),
      equipo: certificado.equipo_recepcion.equipo_descripcion,
      firmas: certificado.firmas.map((f) => ({
        etapa: f.etapa,
        titular: f.certificado_titular,
        fecha_firma: f.fecha_firma,
      })),
    };
  }

  async findAll(equipoRecepcionId?: number) {
    const where = equipoRecepcionId
      ? { equipo_recepcion_id: equipoRecepcionId }
      : {};

    const certificados = await this.prisma.certificado.findMany({
      where,
      orderBy: { fecha_subida: 'desc' },
      include: {
        tecnico: { select: { id: true, nombre: true, apellidos: true } },
        equipo_recepcion: {
          select: {
            id: true,
            estado: true,
            equipo_descripcion: true,
            laboratorio: { select: { id: true, nombre: true } },
            orden_trabajo: {
              select: {
                orden_trabajo_fisica: true,
                cliente: { select: { id: true, nombre: true } },
              },
            },
          },
        },
      },
    });

    return certificados.map(conNumeroFormateado);
  }

  async findOne(id: number) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        equipo_recepcion: {
          select: { id: true },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    return conNumeroFormateado(certificado);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.certificado.delete({ where: { id } });
  }
}
