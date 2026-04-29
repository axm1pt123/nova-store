import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatePaymentIntentParams,
  PaymentGateway,
  PaymentIntentResult,
} from '@modules/payments/application/ports/payment-gateway.port';

/**
 * Adaptador: gateway simulado para desarrollo y testing.
 *
 * Siempre marca los pagos como exitosos. Útil para probar el flujo
 * end-to-end sin depender de cuentas externas.
 */
@Injectable()
export class SimulatedPaymentGateway implements PaymentGateway {
  readonly providerName = 'SIMULATED' as const;

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    return {
      externalPaymentId: `sim_${uuidv4()}`,
      status: 'succeeded',
      metadata: {
        simulated: true,
        orderId: params.orderId,
        amountCents: params.amount.amountCents,
      },
    };
  }

  async verifyPayment(externalPaymentId: string) {
    return {
      status: 'succeeded' as const,
      metadata: { simulated: true, externalPaymentId },
    };
  }
}
