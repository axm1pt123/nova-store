import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';
import { Money } from '@shared/domain/value-objects/money.vo';

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Money;
  stock: number;
  imageUrl: string | null;
  images: string[];
  discountPercent: number | null;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad: Product.
 *
 * Reglas de negocio encapsuladas:
 *  - El stock no puede ser negativo
 *  - Sólo productos activos con stock se pueden vender
 *  - decreaseStock valida disponibilidad antes de descontar
 */
export class Product {
  private constructor(private props: ProductProps) {}

  static create(props: ProductProps): Product {
    if (!props.name || props.name.trim().length < 3) {
      throw new BusinessRuleViolationException('Product name must be at least 3 characters');
    }
    if (props.stock < 0) {
      throw new BusinessRuleViolationException('Stock cannot be negative');
    }
    if (!props.categoryId) {
      throw new BusinessRuleViolationException('Product must belong to a category');
    }
    return new Product({ ...props });
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get description(): string { return this.props.description; }
  get price(): Money { return this.props.price; }
  get stock(): number { return this.props.stock; }
  get imageUrl(): string | null { return this.props.imageUrl; }
  get images(): string[] { return this.props.images; }
  get discountPercent(): number | null { return this.props.discountPercent; }
  get categoryId(): string { return this.props.categoryId; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isAvailable(): boolean {
    return this.props.isActive && this.props.stock > 0;
  }

  hasEnoughStock(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationException('Quantity must be positive');
    }
    if (!this.hasEnoughStock(quantity)) {
      throw new BusinessRuleViolationException(
        `Insufficient stock for "${this.props.name}". Available: ${this.props.stock}, requested: ${quantity}`,
      );
    }
    this.props.stock -= quantity;
    this.props.updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationException('Quantity must be positive');
    }
    this.props.stock += quantity;
    this.props.updatedAt = new Date();
  }

  update(data: Partial<Pick<ProductProps, 'name' | 'description' | 'price' | 'imageUrl' | 'images' | 'discountPercent' | 'categoryId' | 'isActive'>>): void {
    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        throw new BusinessRuleViolationException('Product name must be at least 3 characters');
      }
      this.props.name = data.name.trim();
    }
    if (data.description !== undefined) this.props.description = data.description;
    if (data.price !== undefined) this.props.price = data.price;
    if (data.imageUrl !== undefined) this.props.imageUrl = data.imageUrl;
    if (data.images !== undefined) this.props.images = data.images;
    if (data.discountPercent !== undefined) this.props.discountPercent = data.discountPercent;
    if (data.categoryId !== undefined) this.props.categoryId = data.categoryId;
    if (data.isActive !== undefined) this.props.isActive = data.isActive;
    this.props.updatedAt = new Date();
  }
}
