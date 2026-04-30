import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { Money } from '@shared/domain/value-objects/money.vo';
import { OrderStatus, OrderStatusValue } from '../value-objects/order-status.vo';

export interface OrderItemProps {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem {
  private constructor(private props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    if (props.quantity <= 0) {
      throw new BusinessRuleViolationException('Order item quantity must be positive');
    }
    if (!props.productName) {
      throw new BusinessRuleViolationException('Order item must have a product name snapshot');
    }
    return new OrderItem({ ...props });
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get productName(): string { return this.props.productName; }
  get quantity(): number { return this.props.quantity; }
  get unitPrice(): Money { return this.props.unitPrice; }

  subtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }
}

export interface OrderProps {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: Money;
  shippingAddress: string;
  paymentProofUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root: Order.
 *
 * Representa un pedido inmutable en su estructura: una vez creado,
 * sólo cambia su estado vía transiciones controladas.
 * El total se calcula al construirse y se persiste como snapshot.
 */
export class Order {
  private constructor(private props: OrderProps) {}

  static create(params: {
    id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: string;
  }): Order {
    if (params.items.length === 0) {
      throw new BusinessRuleViolationException('Cannot create an order with no items');
    }
    if (!params.shippingAddress || params.shippingAddress.trim().length < 5) {
      throw new BusinessRuleViolationException('A valid shipping address is required');
    }

    const currency = params.items[0].unitPrice.currency;
    const total = params.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero(currency),
    );

    const now = new Date();
    return new Order({
      id: params.id,
      userId: params.userId,
      items: params.items,
      status: OrderStatus.pending(),
      total,
      shippingAddress: params.shippingAddress.trim(),
      paymentProofUrl: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get items(): readonly OrderItem[] { return this.props.items; }
  get status(): OrderStatus { return this.props.status; }
  get total(): Money { return this.props.total; }
  get shippingAddress(): string { return this.props.shippingAddress; }
  get paymentProofUrl(): string | null { return this.props.paymentProofUrl; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  submitPaymentProof(url: string): void {
    if (!url) throw new BusinessRuleViolationException('Payment proof URL is required');
    this.props.paymentProofUrl = url;
    this.props.status = this.props.status.transitionTo('PENDING_VERIFICATION');
    this.props.updatedAt = new Date();
  }

  markAs(target: OrderStatusValue): void {
    this.props.status = this.props.status.transitionTo(target);
    this.props.updatedAt = new Date();
  }

  markAsPaid(): void { this.markAs('PAID'); }
  markAsShipped(): void { this.markAs('SHIPPED'); }
  markAsDelivered(): void { this.markAs('DELIVERED'); }
  cancel(): void { this.markAs('CANCELLED'); }
}
