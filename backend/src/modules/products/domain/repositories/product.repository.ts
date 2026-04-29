import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters, pagination: PaginationParams): Promise<PaginatedResult<Product>>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
