import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Money } from '@shared/domain/value-objects/money.vo';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '@shared/domain/exceptions/domain.exceptions';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/repositories/category.repository';
import {
  CreateProductDto,
  ListProductsQueryDto,
  PaginatedProductsDto,
  ProductResponseDto,
  UpdateProductDto,
} from '../dtos/product.dtos';
import { ProductMapper, slugify } from '../dtos/product.mapper';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
    const category = await this.categories.findById(dto.categoryId);
    if (!category) throw new EntityNotFoundException('Category', dto.categoryId);

    const now = new Date();
    const product = Product.create({
      id: uuidv4(),
      name: dto.name.trim(),
      slug: slugify(dto.name),
      description: dto.description,
      price: Money.fromDecimal(dto.price),
      stock: dto.stock,
      imageUrl: dto.imageUrl ?? null,
      images: dto.images ?? [],
      discountPercent: dto.discountPercent ?? null,
      categoryId: dto.categoryId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await this.products.save(product);
    return ProductMapper.toResponseDto(product);
  }
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.products.findById(id);
    if (!product) throw new EntityNotFoundException('Product', id);

    if (dto.categoryId) {
      const category = await this.categories.findById(dto.categoryId);
      if (!category) throw new EntityNotFoundException('Category', dto.categoryId);
    }

    product.update({
      name: dto.name,
      description: dto.description,
      price: dto.price !== undefined ? Money.fromDecimal(dto.price) : undefined,
      imageUrl: dto.imageUrl,
      images: dto.images,
      discountPercent: dto.discountPercent,
      categoryId: dto.categoryId,
      isActive: dto.isActive,
    });

    if (dto.stock !== undefined) {
      const diff = dto.stock - product.stock;
      if (diff > 0) product.increaseStock(diff);
      else if (diff < 0) product.decreaseStock(-diff);
    }

    await this.products.update(product);
    return ProductMapper.toResponseDto(product);
  }
}

@Injectable()
export class DeleteProductUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.products.findById(id);
    if (!product) throw new EntityNotFoundException('Product', id);
    await this.products.delete(id);
  }
}

@Injectable()
export class GetProductByIdUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(id: string): Promise<ProductResponseDto> {
    const product = await this.products.findById(id);
    if (!product) throw new EntityNotFoundException('Product', id);
    return ProductMapper.toResponseDto(product);
  }
}

@Injectable()
export class ListProductsUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository) {}

  async execute(query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;

    const result = await this.products.findMany(
      {
        categoryId: query.categoryId,
        search: query.search,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        onlyAvailable: true,
      },
      { skip, take },
    );

    return {
      items: result.items.map(ProductMapper.toResponseDto),
      total: result.total,
      skip,
      take,
    };
  }
}
