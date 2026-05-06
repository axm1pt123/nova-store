import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationService,
  OrderConfirmationNotification,
} from '@modules/orders/application/ports/notification.port';

/**
 * Adaptador: NotificationService que loggea a consola.
 *
 * Sirve para desarrollo y como ejemplo. En producción se reemplaza por:
 *  - SMTP (nodemailer)
 *  - SendGrid / Resend / Postmark
 *  - WhatsApp Business API
 *
 * Cambiar de adaptador NO requiere tocar el dominio ni los casos de uso.
 */
@Injectable()
export class ConsoleNotificationService implements NotificationService {
  private readonly logger = new Logger(ConsoleNotificationService.name);

  async sendOrderConfirmation(notification: OrderConfirmationNotification): Promise<void> {
    this.logger.log(
      `📧 [ORDER CONFIRMATION] To: ${notification.toEmail} | ` +
        `Customer: ${notification.customerName} | ` +
        `Order: ${notification.orderId} | ` +
        `Total: ${notification.totalDecimal} ${notification.currency}`,
    );
  }

  async sendOrderStatusChanged(params: {
    toEmail: string;
    orderId: string;
    newStatus: string;
  }): Promise<void> {
    this.logger.log(
      `📧 [STATUS CHANGE] To: ${params.toEmail} | Order: ${params.orderId} | Status: ${params.newStatus}`,
    );
  }

  async sendPaymentProofReceived(params: {
    orderId: string;
    totalDecimal: number;
    currency: string;
  }): Promise<void> {
    this.logger.log(
      `🧾 [PAYMENT PROOF] Order: ${params.orderId} | Total: ${params.totalDecimal} ${params.currency} — Pendiente de verificación`,
    );
  }
}
