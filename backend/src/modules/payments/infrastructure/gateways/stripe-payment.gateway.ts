import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreatePaymentIntentParams,
  PaymentGateway,
  PaymentIntentResult,
} from '@modules/payments/application/ports/payment-gateway.port';

/**
 * Adaptador: gateway de Stripe.
 *
 * Encapsula la SDK de Stripe detrás del puerto PaymentGateway.
 * Si en el futuro se cambia a otro proveedor, los casos de uso no se enteran.
 */
@Injectable()
export class StripePaymentGateway implements PaymentGateway {
  readonly providerName = 'STRIPE' as const;
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripePaymentGateway.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: params.amount.amountCents,
      currency: params.amount.currency.toLowerCase(),
      receipt_email: params.customerEmail,
      description: params.description,
      metadata: { orderId: params.orderId },
    });

    return {
      externalPaymentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status: this.mapStatus(intent.status),
    };
  }

  async verifyPayment(externalPaymentId: string) {
    const intent = await this.stripe.paymentIntents.retrieve(externalPaymentId);
    return {
      status: this.mapStatus(intent.status),
      metadata: { stripeStatus: intent.status },
    };
  }

  private mapStatus(stripeStatus: Stripe.PaymentIntent.Status): 'pending' | 'succeeded' | 'failed' {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
      case 'requires_payment_method':
        return 'failed';
      default:
        return 'pending';
    }
  }
}
