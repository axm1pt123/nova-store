import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Payment as PrismaPayment,
  PaymentProvider as PrismaProvider,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';
import { Money } from '@shared/domain/value-objects/money.vo';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

function toDomain(raw: PrismaPayment): Payment {
  return Payment.reconstitute({
    id: raw.id,
    orderId: raw.orderId,
    provider: raw.provider,
    status: raw.status,
    amount: Money.fromCents(raw.amountCents, raw.currency),
    externalPaymentId: raw.externalPaymentId,
    metadata: raw.metadata as Record<string, unknown> | null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Payment | null> {
    const raw = await this.prisma.payment.findUnique({ where: { id } });
    return raw ? toDomain(raw) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const raw = await this.prisma.payment.findUnique({ where: { orderId } });
    return raw ? toDomain(raw) : null;
  }

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.create({
      data: {
        id: payment.id,
        orderId: payment.orderId,
        provider: payment.provider as PrismaProvider,
        status: payment.status as PrismaPaymentStatus,
        amountCents: payment.amount.amountCents,
        currency: payment.amount.currency,
        externalPaymentId: payment.externalPaymentId,
        metadata: (payment.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });
  }

  async update(payment: Payment): Promise<void> {
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: payment.status as PrismaPaymentStatus,
        externalPaymentId: payment.externalPaymentId,
        metadata: (payment.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        updatedAt: payment.updatedAt,
      },
    });
  }
}
