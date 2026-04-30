import { Injectable } from '@nestjs/common';
import { Cart as PrismaCart, CartItem as PrismaCartItem } from '@prisma/client';
import { Money } from '@shared/domain/value-objects/money.vo';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Cart, CartItem } from '../../domain/entities/cart.entity';
import { CartRepository } from '../../domain/repositories/cart.repository';

type PrismaCartWithItems = PrismaCart & { items: PrismaCartItem[] };

function toDomain(raw: PrismaCartWithItems, currency = 'BOB'): Cart {
  const items = raw.items.map((it) =>
    CartItem.create({
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: Money.fromCents(it.priceCents, currency),
    }),
  );
  return Cart.reconstitute({
    id: raw.id,
    userId: raw.userId,
    items,
    currency,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const raw = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    return raw ? toDomain(raw) : null;
  }

  async findById(id: string): Promise<Cart | null> {
    const raw = await this.prisma.cart.findUnique({ where: { id }, include: { items: true } });
    return raw ? toDomain(raw) : null;
  }

  async save(cart: Cart): Promise<void> {
    await this.prisma.cart.create({
      data: {
        id: cart.id,
        userId: cart.userId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
    });
  }

  /**
   * Sincroniza el estado del aggregate con la BD en una única transacción:
   *  - actualiza el cart
   *  - borra los items existentes
   *  - inserta los items actuales
   *
   * Estrategia simple y correcta para carritos (pocos items por usuario).
   * Para escenarios de mayor escala, se puede pasar a diff-based updates.
   */
  async saveAggregate(cart: Cart): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: cart.updatedAt },
      }),
      this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      ...cart.items.map((item) =>
        this.prisma.cartItem.create({
          data: {
            id: item.id,
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            priceCents: item.unitPrice.amountCents,
          },
        }),
      ),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cart.delete({ where: { id } });
  }
}
