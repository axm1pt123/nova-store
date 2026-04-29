import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';

export interface DateRangeQuery {
  fromDate?: Date;
  toDate?: Date;
}

export interface SalesByDateReportItem {
  date: string; // YYYY-MM-DD
  ordersCount: number;
  totalCents: number;
  totalDecimal: number;
}

export interface TopProductReportItem {
  productId: string;
  productName: string;
  unitsSold: number;
  revenueCents: number;
  revenueDecimal: number;
}

export interface FrequentCustomerReportItem {
  userId: string;
  email: string;
  fullName: string;
  ordersCount: number;
  totalSpentCents: number;
  totalSpentDecimal: number;
}

/**
 * Casos de uso de Reports.
 *
 * Nota arquitectónica: para reportes/analytics es válido y común usar
 * consultas directas al ORM en la capa de aplicación, en lugar de pasar
 * por el modelo de dominio. Las razones:
 *  - Son agregaciones de sólo lectura (no mutan estado)
 *  - Requieren rendimiento (queries optimizados, no recorrer entidades)
 *  - No tienen lógica de negocio compleja, sólo presentación
 *
 * Esto se conoce como CQRS lite: los Commands pasan por el dominio,
 * las Queries pueden ir más directas.
 */
@Injectable()
export class SalesByDateReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(range: DateRangeQuery): Promise<SalesByDateReportItem[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        createdAt: {
          gte: range.fromDate,
          lte: range.toDate,
        },
      },
      select: { createdAt: true, totalCents: true },
    });

    const map = new Map<string, { ordersCount: number; totalCents: number }>();
    for (const order of orders) {
      const date = order.createdAt.toISOString().substring(0, 10);
      const current = map.get(date) ?? { ordersCount: 0, totalCents: 0 };
      current.ordersCount += 1;
      current.totalCents += order.totalCents;
      map.set(date, current);
    }

    return Array.from(map.entries())
      .map(([date, values]) => ({
        date,
        ordersCount: values.ordersCount,
        totalCents: values.totalCents,
        totalDecimal: values.totalCents / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

@Injectable()
export class TopSellingProductsReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { limit?: number } & DateRangeQuery): Promise<TopProductReportItem[]> {
    const limit = params.limit ?? 10;
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          createdAt: {
            gte: params.fromDate,
            lte: params.toDate,
          },
        },
      },
      select: { productId: true, productName: true, quantity: true, priceCents: true },
    });

    const map = new Map<string, TopProductReportItem>();
    for (const item of items) {
      const current = map.get(item.productId) ?? {
        productId: item.productId,
        productName: item.productName,
        unitsSold: 0,
        revenueCents: 0,
        revenueDecimal: 0,
      };
      current.unitsSold += item.quantity;
      current.revenueCents += item.quantity * item.priceCents;
      current.revenueDecimal = current.revenueCents / 100;
      map.set(item.productId, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }
}

@Injectable()
export class FrequentCustomersReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { limit?: number } & DateRangeQuery): Promise<FrequentCustomerReportItem[]> {
    const limit = params.limit ?? 10;
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: params.fromDate, lte: params.toDate },
      },
      select: {
        userId: true,
        totalCents: true,
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    const map = new Map<string, FrequentCustomerReportItem>();
    for (const order of orders) {
      const current = map.get(order.userId) ?? {
        userId: order.userId,
        email: order.user.email,
        fullName: `${order.user.firstName} ${order.user.lastName}`,
        ordersCount: 0,
        totalSpentCents: 0,
        totalSpentDecimal: 0,
      };
      current.ordersCount += 1;
      current.totalSpentCents += order.totalCents;
      current.totalSpentDecimal = current.totalSpentCents / 100;
      map.set(order.userId, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, limit);
  }
}
