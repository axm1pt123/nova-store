import { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
}
