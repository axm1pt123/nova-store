import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsNumber() @Min(0) price!: number;
  @IsInt() @Min(0) stock!: number;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsInt() @Min(0) discountPercent?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() @Min(0) discountPercent?: number | null;
}

export class ListProductsQueryDto {
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) take?: number;
}

export class CreateCategoryDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() description?: string;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  priceDecimal: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  discountPercent: number | null;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: Date;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface PaginatedProductsDto {
  items: ProductResponseDto[];
  total: number;
  skip: number;
  take: number;
}
