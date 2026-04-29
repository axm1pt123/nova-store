import { Module } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  ListCategoriesUseCase,
} from './application/use-cases/category.use-cases';
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
} from './application/use-cases/product.use-cases';
import {
  CategoriesController,
  ProductsController,
} from './infrastructure/controllers/products.controller';
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

@Module({
  controllers: [ProductsController, CategoriesController],
  providers: [
    // Use cases
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductByIdUseCase,
    ListProductsUseCase,
    CreateCategoryUseCase,
    DeleteCategoryUseCase,
    ListCategoriesUseCase,
    // Adapters
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
  ],
  exports: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY],
})
export class ProductsModule {}
