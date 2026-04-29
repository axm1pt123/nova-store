import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/repositories/category.repository';
import { CategoryResponseDto, CreateCategoryDto } from '../dtos/product.dtos';
import { CategoryMapper, slugify } from '../dtos/product.mapper';
import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';

@Injectable()
export class CreateCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = slugify(dto.name);
    const existing = await this.categories.findBySlug(slug);
    if (existing) {
      throw new BusinessRuleViolationException(`Category with slug "${slug}" already exists`);
    }

    const now = new Date();
    const category = Category.create({
      id: uuidv4(),
      name: dto.name.trim(),
      slug,
      description: dto.description ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await this.categories.save(category);
    return CategoryMapper.toResponseDto(category);
  }
}

@Injectable()
export class ListCategoriesUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const all = await this.categories.findAll();
    return all.map(CategoryMapper.toResponseDto);
  }
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categories.findById(id);
    if (!category) throw new BusinessRuleViolationException(`Category not found`);
    await this.categories.delete(id);
  }
}
