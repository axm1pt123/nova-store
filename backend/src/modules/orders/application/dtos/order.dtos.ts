import { IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatusValue } from '../../domain/value-objects/order-status.vo';

export class CreateOrderDto {
  @ApiProperty({ example: 'Av. Arce 123, La Paz, Bolivia' })
  @IsString() @IsNotEmpty() @MinLength(5) shippingAddress!: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'], example: 'SHIPPED' })
  @IsString()
  @IsIn(['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status!: OrderStatusValue;
}

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  unitPriceDecimal: number;
  subtotalCents: number;
  subtotalDecimal: number;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  status: OrderStatusValue;
  totalCents: number;
  totalDecimal: number;
  currency: string;
  shippingAddress: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderMapper {
  static toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status.value,
      totalCents: order.total.amountCents,
      totalDecimal: order.total.toDecimal(),
      currency: order.total.currency,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => {
        const subtotal = item.subtotal();
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPriceCents: item.unitPrice.amountCents,
          unitPriceDecimal: item.unitPrice.toDecimal(),
          subtotalCents: subtotal.amountCents,
          subtotalDecimal: subtotal.toDecimal(),
        };
      }),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
