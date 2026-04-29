import { IsInt, IsUUID, Min } from 'class-validator';
import { Cart } from '../../domain/entities/cart.entity';

export class AddToCartDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class UpdateCartItemDto {
  @IsInt() @Min(1) quantity!: number;
}

export interface CartItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  unitPriceDecimal: number;
  subtotalCents: number;
  subtotalDecimal: number;
}

export interface CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  itemCount: number;
  totalCents: number;
  totalDecimal: number;
  currency: string;
  updatedAt: Date;
}

export class CartMapper {
  static toResponseDto(cart: Cart): CartResponseDto {
    const total = cart.total();
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => {
        const subtotal = item.subtotal();
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.unitPrice.amountCents,
          unitPriceDecimal: item.unitPrice.toDecimal(),
          subtotalCents: subtotal.amountCents,
          subtotalDecimal: subtotal.toDecimal(),
        };
      }),
      itemCount: cart.itemCount(),
      totalCents: total.amountCents,
      totalDecimal: total.toDecimal(),
      currency: cart.currency,
      updatedAt: cart.updatedAt,
    };
  }
}
