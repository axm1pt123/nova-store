import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '@shared/domain/exceptions/domain.exceptions';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '@modules/orders/domain/repositories/order.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/users/domain/repositories/user.repository';
import { Payment } from '../../domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  PaymentRepository,
} from '../../domain/repositories/payment.repository';
import {
  PAYMENT_GATEWAY,
  PaymentGateway,
} from '../ports/payment-gateway.port';
import { CreatePaymentDto, PaymentMapper, PaymentResponseDto } from '../dtos/payment.dtos';

/**
 * Caso de uso: Iniciar el pago de un pedido.
 *
 * Crea un PaymentIntent en el gateway configurado y persiste un Payment en estado PENDING.
 * El frontend usará el clientSecret/redirectUrl para completar el pago.
 */
@Injectable()
export class InitiatePaymentUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async execute(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.orders.findById(dto.orderId);
    if (!order) throw new EntityNotFoundException('Order', dto.orderId);
    if (order.userId !== userId) {
      throw new BusinessRuleViolationException('Cannot pay for an order that is not yours');
    }
    if (order.status.value !== 'PENDING') {
      throw new BusinessRuleViolationException(
        `Cannot pay for an order in status ${order.status.value}`,
      );
    }

    const existing = await this.payments.findByOrderId(order.id);
    if (existing && existing.status === 'COMPLETED') {
      throw new BusinessRuleViolationException('This order has already been paid');
    }

    const user = await this.users.findById(userId);
    if (!user) throw new EntityNotFoundException('User', userId);

    const intent = await this.gateway.createPaymentIntent({
      amount: order.total,
      orderId: order.id,
      customerEmail: user.email.value,
      description: `Order ${order.id}`,
    });

    const payment = Payment.create({
      id: uuidv4(),
      orderId: order.id,
      provider: this.gateway.providerName,
      amount: order.total,
    });

    if (intent.status === 'succeeded') {
      payment.markAsCompleted(intent.externalPaymentId, intent.metadata);
      order.markAsPaid();
      await this.orders.update(order);
    }

    await this.payments.save(payment);
    return PaymentMapper.toResponseDto(payment, intent.clientSecret);
  }
}

/**
 * Caso de uso: Confirmar pago.
 *
 * Llamado desde un webhook o desde el frontend tras completar el pago.
 * Verifica con el gateway y actualiza el estado.
 */
@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: PaymentRepository,
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async execute(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) throw new EntityNotFoundException('Payment', paymentId);
    if (payment.status === 'COMPLETED') return PaymentMapper.toResponseDto(payment);

    if (!payment.externalPaymentId) {
      throw new BusinessRuleViolationException('Payment has no external reference yet');
    }

    const result = await this.gateway.verifyPayment(payment.externalPaymentId);
    if (result.status === 'succeeded') {
      payment.markAsCompleted(payment.externalPaymentId, result.metadata);
      const order = await this.orders.findById(payment.orderId);
      if (order && order.status.value === 'PENDING') {
        order.markAsPaid();
        await this.orders.update(order);
      }
    } else if (result.status === 'failed') {
      payment.markAsFailed('Gateway reported failure');
    }

    await this.payments.update(payment);
    return PaymentMapper.toResponseDto(payment);
  }
}
