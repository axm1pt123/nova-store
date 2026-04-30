import { Product } from '../../domain/entities/product.entity';
import { Category } from '../../domain/entities/category.entity';
import { CategoryResponseDto, ProductResponseDto } from './product.dtos';

export class ProductMapper {
  static toResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.price.amountCents,
      priceDecimal: product.price.toDecimal(),
      currency: product.price.currency,
      stock: product.stock,
      imageUrl: product.imageUrl,
      images: product.images,
      discountPercent: product.discountPercent,
      categoryId: product.categoryId,
      isActive: product.isActive,
      isAvailable: product.isAvailable(),
      createdAt: product.createdAt,
    };
  }
}

export class CategoryMapper {
  static toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    };
  }
}

/** Helper para crear slugs URL-friendly */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remueve acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
