import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatusValue } from '../../domain/value-objects/order-status.vo';

export class CreateOrderDto {
  @ApiProperty({ example: 'Av. Arce 123, La Paz, Bolivia' })
  @IsString() @IsNotEmpty() @MinLength(5) shippingAddress!: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['PENDING', 'PENDING_VERIFICATION', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  @IsString()
  @IsIn(['PENDING', 'PENDING_VERIFICATION', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status!: OrderStatusValue;
}

export class InStoreSaleItemDto {
  @ApiProperty({ example: 'uuid-producto' })
  @IsString() @IsNotEmpty() productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt() @Min(1) quantity!: number;
}

export class CreateInStoreSaleDto {
  @ApiProperty({ type: [InStoreSaleItemDto] })
  @IsArray() items!: InStoreSaleItemDto[];

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional() @IsString() customerName?: string;

  @ApiPropertyOptional({ example: 'Efectivo' })
  @IsOptional() @IsString() paymentMethod?: string;
}

export class SubmitPaymentProofDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'URL del comprobante de pago' })
  @IsString() @IsNotEmpty() paymentProofUrl!: string;
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
  paymentProofUrl: string | null;
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
      paymentProofUrl: order.paymentProofUrl,
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
