export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');

export interface OrderConfirmationNotification {
  toEmail: string;
  customerName: string;
  orderId: string;
  totalDecimal: number;
  currency: string;
}

/**
 * Puerto: Servicio de notificaciones.
 *
 * El dominio sólo conoce esta abstracción.
 * Los adaptadores concretos (SMTP, SendGrid, WhatsApp Business API, etc.)
 * viven en infraestructura.
 */
export interface NotificationService {
  sendOrderConfirmation(notification: OrderConfirmationNotification): Promise<void>;
  sendOrderStatusChanged(params: { toEmail: string; orderId: string; newStatus: string }): Promise<void>;
  sendPaymentProofReceived?(params: { orderId: string; totalDecimal: number; currency: string }): Promise<void>;
}
