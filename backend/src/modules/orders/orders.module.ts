import { Module } from '@nestjs/common';
import { CartModule } from '@modules/cart/cart.module';
import { ProductsModule } from '@modules/products/products.module';
import { UsersModule } from '@modules/users/users.module';
import { ConsoleNotificationService } from '@shared/infrastructure/auth/console-notification.service';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository';
import { NOTIFICATION_SERVICE } from './application/ports/notification.port';
import {
  CreateOrderFromCartUseCase,
  GetOrderByIdUseCase,
  GetUserOrdersUseCase,
  ListAllOrdersUseCase,
  SubmitPaymentProofUseCase,
  UpdateOrderStatusUseCase,
  VerifyPaymentUseCase,
} from './application/use-cases/order.use-cases';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';

@Module({
  imports: [CartModule, ProductsModule, UsersModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderFromCartUseCase,
    GetUserOrdersUseCase,
    GetOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    ListAllOrdersUseCase,
    SubmitPaymentProofUseCase,
    VerifyPaymentUseCase,
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    { provide: NOTIFICATION_SERVICE, useClass: ConsoleNotificationService },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
