import { Money } from '@shared/domain/value-objects/money.vo';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface CreatePaymentIntentParams {
  amount: Money;
  orderId: string;
  customerEmail: string;
  description?: string;
}

export interface PaymentIntentResult {
  externalPaymentId: string;
  clientSecret?: string; // útil para Stripe en el frontend
  redirectUrl?: string;  // útil para PayPal
  status: 'pending' | 'succeeded' | 'failed';
  metadata?: Record<string, unknown>;
}

/**
 * Puerto: PaymentGateway.
 *
 * Abstracción del proveedor de pagos. La aplicación NUNCA habla con Stripe
 * directamente: habla con esta interfaz. Los adaptadores concretos
 * (StripeGateway, PayPalGateway, SimulatedGateway) viven en infraestructura.
 *
 * Esto permite:
 *  - Cambiar de proveedor con un cambio de configuración
 *  - Testear los casos de uso con un fake del gateway
 *  - Soportar múltiples proveedores en paralelo
 */
export interface PaymentGateway {
  readonly providerName: 'STRIPE' | 'PAYPAL' | 'SIMULATED';

  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;

  /**
   * Verifica el estado de un pago contra el proveedor.
   * Útil para webhooks o reconciliación.
   */
  verifyPayment(externalPaymentId: string): Promise<{
    status: 'pending' | 'succeeded' | 'failed';
    metadata?: Record<string, unknown>;
  }>;
}
