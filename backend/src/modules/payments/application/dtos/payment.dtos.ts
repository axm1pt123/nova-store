import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../../domain/entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-de-la-orden' })
  @IsUUID() orderId!: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  provider: string;
  status: string;
  amountCents: number;
  amountDecimal: number;
  currency: string;
  externalPaymentId: string | null;
  clientSecret?: string;
  createdAt: Date;
}

export class PaymentMapper {
  static toResponseDto(payment: Payment, clientSecret?: string): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      status: payment.status,
      amountCents: payment.amount.amountCents,
      amountDecimal: payment.amount.toDecimal(),
      currency: payment.amount.currency,
      externalPaymentId: payment.externalPaymentId,
      clientSecret,
      createdAt: payment.createdAt,
    };
  }
}
