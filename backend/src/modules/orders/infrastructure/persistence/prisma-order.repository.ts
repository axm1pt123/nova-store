import { Injectable } from '@nestjs/common';
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
  Prisma,
} from '@prisma/client';
import { Money } from '@shared/domain/value-objects/money.vo';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Order, OrderItem } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import {
  OrderListFilters,
  OrderRepository,
  PaginatedOrders,
} from '../../domain/repositories/order.repository';

type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

function toDomain(raw: PrismaOrderWithItems): Order {
  const items = raw.items.map((it) =>
    OrderItem.create({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: Money.fromCents(it.priceCents, raw.currency),
    }),
  );
  return Order.reconstitute({
    id: raw.id,
    userId: raw.userId,
    items,
    status: OrderStatus.create(raw.status),
    total: Money.fromCents(raw.totalCents, raw.currency),
    shippingAddress: raw.shippingAddress,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDomain);
  }

  async findMany(
    filters: OrderListFilters,
    pagination: { skip?: number; take?: number },
  ): Promise<PaginatedOrders> {
    const where: Prisma.OrderWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status as PrismaOrderStatus;
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDomain), total };
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status.value as PrismaOrderStatus,
        totalCents: order.total.amountCents,
        currency: order.total.currency,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceCents: item.unitPrice.amountCents,
          })),
        },
      },
    });
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status.value as PrismaOrderStatus,
        updatedAt: order.updatedAt,
      },
    });
  }
}
