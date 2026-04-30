import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';

export type OrderStatusValue = 'PENDING' | 'PENDING_VERIFICATION' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export class OrderStatus {
  private static readonly TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
    PENDING:              ['PENDING_VERIFICATION', 'CANCELLED'],
    PENDING_VERIFICATION: ['PAID', 'PENDING', 'CANCELLED'],
    PAID:                 ['SHIPPED', 'CANCELLED'],
    SHIPPED:              ['DELIVERED'],
    DELIVERED:            [],
    CANCELLED:            [],
  };

  private constructor(private readonly _value: OrderStatusValue) {}

  static create(value: OrderStatusValue): OrderStatus { return new OrderStatus(value); }
  static pending(): OrderStatus { return new OrderStatus('PENDING'); }

  get value(): OrderStatusValue { return this._value; }

  canTransitionTo(target: OrderStatusValue): boolean {
    return OrderStatus.TRANSITIONS[this._value].includes(target);
  }

  transitionTo(target: OrderStatusValue): OrderStatus {
    if (!this.canTransitionTo(target)) {
      throw new BusinessRuleViolationException(
        `Cannot transition order from ${this._value} to ${target}`,
      );
    }
    return new OrderStatus(target);
  }

  equals(other: OrderStatus): boolean { return this._value === other._value; }
  isTerminal(): boolean { return OrderStatus.TRANSITIONS[this._value].length === 0; }
}
