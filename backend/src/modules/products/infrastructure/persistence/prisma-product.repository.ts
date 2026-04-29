import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Product } from '../../domain/entities/product.entity';
import {
  PaginatedResult,
  PaginationParams,
  ProductFilters,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import { ProductPersistenceMapper } from '../mappers/product.persistence-mapper';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { id } });
    return raw ? ProductPersistenceMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { slug } });
    return raw ? ProductPersistenceMapper.toDomain(raw) : null;
  }

  async findMany(
    filters: ProductFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Product>> {
    const where = this.buildWhereClause(filters);

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map(ProductPersistenceMapper.toDomain),
      total,
    };
  }

  async save(product: Product): Promise<void> {
    await this.prisma.product.create({ data: ProductPersistenceMapper.toPersistence(product) });
  }

  async update(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.id },
      data: ProductPersistenceMapper.toPersistence(product),
    });
  }

  async delete(id: string): Promise<void> {
    const orderItems = await this.prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      // Tiene historial de pedidos — solo desactivar
      await this.prisma.product.update({ where: { id }, data: { isActive: false } });
      return;
    }
    // Sin pedidos — borrar cart items y luego el producto
    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
  }

  private buildWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.onlyAvailable) {
      where.isActive = true;
      where.stock = { gt: 0 };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceCents = {};
      if (filters.minPrice !== undefined) where.priceCents.gte = Math.round(filters.minPrice * 100);
      if (filters.maxPrice !== undefined) where.priceCents.lte = Math.round(filters.maxPrice * 100);
    }
    return where;
  }
}
