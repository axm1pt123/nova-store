import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from '@modules/orders/orders.module';
import { UsersModule } from '@modules/users/users.module';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { PAYMENT_GATEWAY } from './application/ports/payment-gateway.port';
import {
  ConfirmPaymentUseCase,
  InitiatePaymentUseCase,
} from './application/use-cases/payment.use-cases';
import { PaymentsController } from './infrastructure/controllers/payments.controller';
import { SimulatedPaymentGateway } from './infrastructure/gateways/simulated-payment.gateway';
import { StripePaymentGateway } from './infrastructure/gateways/stripe-payment.gateway';
import { PrismaPaymentRepository } from './infrastructure/persistence/prisma-payment.repository';

/**
 * Módulo Payments.
 *
 * Estrategia: el gateway concreto se elige por configuración (PAYMENT_PROVIDER).
 * En desarrollo se usa SIMULATED por defecto. En producción, STRIPE.
 * Agregar PayPal sólo requiere implementar otro adaptador y enchufarlo aquí.
 */
@Module({
  imports: [ConfigModule, OrdersModule, UsersModule],
  controllers: [PaymentsController],
  providers: [
    InitiatePaymentUseCase,
    ConfirmPaymentUseCase,
    SimulatedPaymentGateway,
    StripePaymentGateway,
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService, SimulatedPaymentGateway, StripePaymentGateway],
      useFactory: (
        config: ConfigService,
        simulated: SimulatedPaymentGateway,
        stripe: StripePaymentGateway,
      ) => {
        const provider = (config.get<string>('PAYMENT_PROVIDER') ?? 'SIMULATED').toUpperCase();
        if (provider === 'STRIPE') return stripe;
        return simulated;
      },
    },
  ],
})
export class PaymentsModule {}
