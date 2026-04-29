import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { Money } from '@shared/domain/value-objects/money.vo';

export type PaymentStatusValue = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentProviderValue = 'STRIPE' | 'PAYPAL' | 'SIMULATED';

export interface PaymentProps {
  id: string;
  orderId: string;
  provider: PaymentProviderValue;
  status: PaymentStatusValue;
  amount: Money;
  externalPaymentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad Payment.
 *
 * Representa un intento de pago. Encapsula transiciones válidas:
 *  PENDING → COMPLETED | FAILED
 *  COMPLETED → REFUNDED
 *  FAILED y REFUNDED son terminales
 */
export class Payment {
  private constructor(private props: PaymentProps) {}

  static create(params: {
    id: string;
    orderId: string;
    provider: PaymentProviderValue;
    amount: Money;
  }): Payment {
    const now = new Date();
    return new Payment({
      id: params.id,
      orderId: params.orderId,
      provider: params.provider,
      status: 'PENDING',
      amount: params.amount,
      externalPaymentId: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PaymentProps): Payment {
    return new Payment(props);
  }

  get id(): string { return this.props.id; }
  get orderId(): string { return this.props.orderId; }
  get provider(): PaymentProviderValue { return this.props.provider; }
  get status(): PaymentStatusValue { return this.props.status; }
  get amount(): Money { return this.props.amount; }
  get externalPaymentId(): string | null { return this.props.externalPaymentId; }
  get metadata(): Record<string, unknown> | null { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  markAsCompleted(externalPaymentId: string, metadata?: Record<string, unknown>): void {
    if (this.props.status !== 'PENDING') {
      throw new BusinessRuleViolationException(
        `Cannot complete a payment in status ${this.props.status}`,
      );
    }
    this.props.status = 'COMPLETED';
    this.props.externalPaymentId = externalPaymentId;
    this.props.metadata = metadata ?? this.props.metadata;
    this.props.updatedAt = new Date();
  }

  markAsFailed(reason?: string): void {
    if (this.props.status !== 'PENDING') {
      throw new BusinessRuleViolationException(
        `Cannot fail a payment in status ${this.props.status}`,
      );
    }
    this.props.status = 'FAILED';
    this.props.metadata = { ...(this.props.metadata ?? {}), failureReason: reason };
    this.props.updatedAt = new Date();
  }

  refund(): void {
    if (this.props.status !== 'COMPLETED') {
      throw new BusinessRuleViolationException(
        `Cannot refund a payment in status ${this.props.status}`,
      );
    }
    this.props.status = 'REFUNDED';
    this.props.updatedAt = new Date();
  }
}
