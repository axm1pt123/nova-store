import { Module } from '@nestjs/common';
import { ProductsModule } from '@modules/products/products.module';
import { CART_REPOSITORY } from './domain/repositories/cart.repository';
import {
  AddToCartUseCase,
  ClearCartUseCase,
  GetCartUseCase,
  RemoveFromCartUseCase,
  UpdateCartItemUseCase,
} from './application/use-cases/cart.use-cases';
import { CartController } from './infrastructure/controllers/cart.controller';
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';

@Module({
  imports: [ProductsModule], // necesitamos PRODUCT_REPOSITORY
  controllers: [CartController],
  providers: [
    GetCartUseCase,
    AddToCartUseCase,
    UpdateCartItemUseCase,
    RemoveFromCartUseCase,
    ClearCartUseCase,
    { provide: CART_REPOSITORY, useClass: PrismaCartRepository },
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
