import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { Money } from '@shared/domain/value-objects/money.vo';

export interface CartItemProps {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
}

/**
 * Entidad anidada: CartItem.
 * Representa una línea del carrito. El precio se "congela" al agregarse
 * para evitar inconsistencias si el producto cambia de precio luego.
 */
export class CartItem {
  private constructor(private props: CartItemProps) {}

  static create(props: CartItemProps): CartItem {
    if (props.quantity <= 0) {
      throw new BusinessRuleViolationException('Cart item quantity must be positive');
    }
    return new CartItem({ ...props });
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get quantity(): number { return this.props.quantity; }
  get unitPrice(): Money { return this.props.unitPrice; }

  subtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }

  changeQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationException('Quantity must be positive');
    }
    this.props.quantity = quantity;
  }
}

export interface CartProps {
  id: string;
  userId: string;
  items: CartItem[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root: Cart.
 *
 * Encapsula toda la lógica del carrito:
 *  - Agregar/quitar items
 *  - Cambiar cantidades
 *  - Calcular totales
 *  - Verificar si está vacío
 *
 * El controller y los use cases NUNCA manipulan items directamente,
 * sólo a través de los métodos del aggregate.
 */
export class Cart {
  private constructor(private props: CartProps) {}

  static create(props: Omit<CartProps, 'items'> & { items?: CartItem[] }): Cart {
    return new Cart({ ...props, items: props.items ?? [] });
  }

  static reconstitute(props: CartProps): Cart {
    return new Cart(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get items(): readonly CartItem[] { return this.props.items; }
  get currency(): string { return this.props.currency; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isEmpty(): boolean {
    return this.props.items.length === 0;
  }

  itemCount(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  total(): Money {
    return this.props.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero(this.props.currency),
    );
  }

  findItemByProductId(productId: string): CartItem | undefined {
    return this.props.items.find((item) => item.productId === productId);
  }

  /**
   * Agrega un producto al carrito. Si ya existe, suma a la cantidad existente.
   */
  addItem(item: { id: string; productId: string; quantity: number; unitPrice: Money }): void {
    if (item.unitPrice.currency !== this.props.currency) {
      throw new BusinessRuleViolationException(
        `Cannot add item in ${item.unitPrice.currency} to a ${this.props.currency} cart`,
      );
    }
    const existing = this.findItemByProductId(item.productId);
    if (existing) {
      existing.changeQuantity(existing.quantity + item.quantity);
    } else {
      this.props.items.push(
        CartItem.create({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }),
      );
    }
    this.props.updatedAt = new Date();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.findItemByProductId(productId);
    if (!item) {
      throw new BusinessRuleViolationException(`Product ${productId} is not in the cart`);
    }
    item.changeQuantity(quantity);
    this.props.updatedAt = new Date();
  }

  removeItem(productId: string): void {
    const idx = this.props.items.findIndex((item) => item.productId === productId);
    if (idx === -1) {
      throw new BusinessRuleViolationException(`Product ${productId} is not in the cart`);
    }
    this.props.items.splice(idx, 1);
    this.props.updatedAt = new Date();
  }

  clear(): void {
    this.props.items = [];
    this.props.updatedAt = new Date();
  }
}
