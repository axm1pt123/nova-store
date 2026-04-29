import { Category as PrismaCategory, Product as PrismaProduct } from '@prisma/client';
import { Money } from '@shared/domain/value-objects/money.vo';
import { Product } from '../../domain/entities/product.entity';
import { Category } from '../../domain/entities/category.entity';

export class ProductPersistenceMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.reconstitute({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      price: Money.fromCents(raw.priceCents, raw.currency),
      stock: raw.stock,
      imageUrl: raw.imageUrl,
      discountPercent: raw.discountPercent,
      categoryId: raw.categoryId,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.price.amountCents,
      currency: product.price.currency,
      stock: product.stock,
      imageUrl: product.imageUrl,
      discountPercent: product.discountPercent,
      categoryId: product.categoryId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export class CategoryPersistenceMapper {
  static toDomain(raw: PrismaCategory): Category {
    return Category.reconstitute({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(category: Category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
