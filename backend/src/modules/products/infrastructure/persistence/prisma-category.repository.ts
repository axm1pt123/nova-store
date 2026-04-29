import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryPersistenceMapper } from '../mappers/product.persistence-mapper';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({ where: { id } });
    return raw ? CategoryPersistenceMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const raw = await this.prisma.category.findUnique({ where: { slug } });
    return raw ? CategoryPersistenceMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map(CategoryPersistenceMapper.toDomain);
  }

  async save(category: Category): Promise<void> {
    await this.prisma.category.create({ data: CategoryPersistenceMapper.toPersistence(category) });
  }

  async update(category: Category): Promise<void> {
    await this.prisma.category.update({
      where: { id: category.id },
      data: CategoryPersistenceMapper.toPersistence(category),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
