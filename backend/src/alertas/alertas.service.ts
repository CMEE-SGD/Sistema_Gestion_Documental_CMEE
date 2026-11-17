import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacturacionService } from '../facturacion/facturacion.service';
import { InventarioService } from '../inventario/inventario.service';

/** Una factura sin vencer solo alerta cuando faltan este número de días o menos. */
export const DIAS_AVISO_FACTURAS = 7;
/** Horizonte (días) en que una calibración próxima entra como alerta. */
export const DIAS_AVISO_CALIBRACIONES = 30;
/** Tope de filas por grupo en el panel; `total` siempre es el conteo real. */
const MAX_ITEMS_POR_GRUPO = 50;

export type SeveridadAlerta = 'critica' | 'advertencia';

export type TipoAlerta =
  | 'FACTURA_VENCIDA'
  | 'FACTURA_POR_VENCER'
  | 'CALIBRACION_VENCIDA'
  | 'CALIBRACION_PROXIMA'
  | 'INVENTARIO_AGOTADO'
  | 'INVENTARIO_BAJO';

export interface AlertaItem {
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  titulo: string;
  detalle: string;
  /** Id del registro afectado (factura, equipo o producto). */
  referencia_id: number;
}

export interface GrupoAlertas {
  clave: 'FACTURAS' | 'CALIBRACIONES' | 'INVENTARIO';
  titulo: string;
  total: number;
  criticas: number;
  items: AlertaItem[];
}

const plural = (n: number, singular: string, pluralTxt: string) =>
  `${n} ${n === 1 ? singular : pluralTxt}`;

/**
 * Alertas operativas del usuario: facturas vencidas o por vencer, equipos con
 * calibración vencida o próxima e insumos bajo el mínimo. Cada fuente solo se
 * incluye si el usuario tiene acceso a su módulo (mismo criterio que los
 * endpoints originales), de modo que nadie ve datos de un módulo vedado.
 */
@Injectable()
export class AlertasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facturacion: FacturacionService,
    private readonly inventario: InventarioService,
  ) {}

  /** Nivel máximo del usuario por aplicación, a partir de sus grupos. */
  private async nivelesPorApp(user: { id: number; isGod?: boolean }) {
    if (user.isGod === true && user.id === -1) return null; // acceso total
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        grupos: { include: { aplicaciones: { include: { aplicacion: true } } } },
      },
    });
    const niveles = new Map<string, number>();
    if (!usuario || !usuario.estado_cuenta || usuario.bloqueado) return niveles;
    for (const g of usuario.grupos) {
      for (const a of g.aplicaciones) {
        const actual = niveles.get(a.aplicacion.nombre) ?? 0;
        if (a.nivel > actual) niveles.set(a.aplicacion.nombre, a.nivel);
      }
    }
    return niveles;
  }

  async obtener(user: { id: number; isGod?: boolean }) {
    const niveles = await this.nivelesPorApp(user);
    const puede = (app: string) => niveles === null || (niveles.get(app) ?? 0) >= 1;

    const grupos: GrupoAlertas[] = [];

    if (puede('Gestion Financiera')) grupos.push(await this.grupoFacturas());
    if (puede('Gestion Financiera') || puede('Recepcion Equipos')) {
      grupos.push(await this.grupoCalibraciones());
    }
    if (puede('Inventario')) grupos.push(await this.grupoInventario());

    return {
      total: grupos.reduce((s, g) => s + g.total, 0),
      criticas: grupos.reduce((s, g) => s + g.criticas, 0),
      grupos,
    };
  }

  private cerrar(
    clave: GrupoAlertas['clave'],
    titulo: string,
    todos: AlertaItem[],
  ): GrupoAlertas {
    return {
      clave,
      titulo,
      total: todos.length,
      criticas: todos.filter((i) => i.severidad === 'critica').length,
      items: todos.slice(0, MAX_ITEMS_POR_GRUPO),
    };
  }

  private async grupoFacturas(): Promise<GrupoAlertas> {
    const cartera = await this.facturacion.cartera();

    const vencidas: AlertaItem[] = [...cartera.vencida]
      .sort((a, b) => b.dias_vencida - a.dias_vencida)
      .map((f) => ({
        tipo: 'FACTURA_VENCIDA',
        severidad: 'critica',
        titulo: `Factura ${f.numero} vencida`,
        detalle: `${f.cliente?.nombre ?? 'Sin cliente'} · saldo $${f.saldo.toFixed(2)} · venció hace ${plural(f.dias_vencida, 'día', 'días')}`,
        referencia_id: f.id,
      }));

    const porVencer: AlertaItem[] = [...cartera.por_vencer]
      .filter((f) => f.dias_restantes <= DIAS_AVISO_FACTURAS)
      .sort((a, b) => a.dias_restantes - b.dias_restantes)
      .map((f) => ({
        tipo: 'FACTURA_POR_VENCER',
        severidad: 'advertencia',
        titulo: `Factura ${f.numero} por vencer`,
        detalle: `${f.cliente?.nombre ?? 'Sin cliente'} · saldo $${f.saldo.toFixed(2)} · ${f.dias_restantes === 0 ? 'vence hoy' : `vence en ${plural(f.dias_restantes, 'día', 'días')}`}`,
        referencia_id: f.id,
      }));

    return this.cerrar('FACTURAS', 'Facturas por vencer', [...vencidas, ...porVencer]);
  }

  private async grupoCalibraciones(): Promise<GrupoAlertas> {
    const equipos = await this.facturacion.proximasCalibraciones(DIAS_AVISO_CALIBRACIONES);

    const items: AlertaItem[] = equipos.map((e) => {
      const vencida = e.estado_calibracion === 'VENCIDA';
      const dias = Math.abs(e.dias_restantes);
      const nombre = e.codigo_cmee
        ? `${e.equipo_descripcion} (${e.codigo_cmee})`
        : e.equipo_descripcion;
      const cliente = e.orden_trabajo?.cliente?.nombre;
      const cuando = vencida
        ? `venció hace ${plural(dias, 'día', 'días')}`
        : dias === 0
          ? 'vence hoy'
          : `vence en ${plural(dias, 'día', 'días')}`;
      return {
        tipo: vencida ? 'CALIBRACION_VENCIDA' : 'CALIBRACION_PROXIMA',
        severidad: vencida ? 'critica' : 'advertencia',
        titulo: `Calibración ${vencida ? 'vencida' : 'próxima'}: ${nombre}`,
        detalle: [cliente, cuando].filter(Boolean).join(' · '),
        referencia_id: e.id,
      };
    });

    return this.cerrar('CALIBRACIONES', 'Próximos equipos a calibrar', items);
  }

  private async grupoInventario(): Promise<GrupoAlertas> {
    const { productos } = await this.inventario.alertas();

    const items: AlertaItem[] = productos
      .map((p) => {
        const stock = Number(p.stock_actual);
        const minimo = Number(p.stock_minimo);
        const agotado = stock <= 0;
        return {
          tipo: (agotado ? 'INVENTARIO_AGOTADO' : 'INVENTARIO_BAJO') as TipoAlerta,
          severidad: (agotado ? 'critica' : 'advertencia') as SeveridadAlerta,
          titulo: `${agotado ? 'Sin stock' : 'Stock bajo'}: ${p.nombre}`,
          detalle: `Quedan ${stock} ${p.unidad.toLowerCase()} (mínimo ${minimo})${p.ubicacion ? ` · ${p.ubicacion}` : ''}`,
          referencia_id: p.id,
          _stock: stock,
        };
      })
      .sort((a, b) => a._stock - b._stock)
      .map(({ _stock, ...resto }) => resto);

    return this.cerrar('INVENTARIO', 'Inventario bajo el mínimo', items);
  }
}
