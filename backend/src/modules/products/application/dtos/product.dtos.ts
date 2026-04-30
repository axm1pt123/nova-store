import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Zapatillas Nike Air Max' })
  @IsString() @IsNotEmpty() name!: string;

  @ApiProperty({ example: 'Zapatillas deportivas de alta performance' })
  @IsString() @IsNotEmpty() description!: string;

  @ApiProperty({ example: 250.00, description: 'Precio en la moneda base (BOB)' })
  @IsNumber() @Min(0) price!: number;

  @ApiProperty({ example: 50 })
  @IsInt() @Min(0) stock!: number;

  @ApiProperty({ example: 'uuid-de-la-categoria' })
  @IsUUID() categoryId!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional() @IsString() imageUrl?: string;

  @ApiPropertyOptional({ type: [String], description: 'URLs de imágenes adicionales del producto' })
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @ApiPropertyOptional({ example: 10, description: 'Porcentaje de descuento (0-100)' })
  @IsOptional() @IsInt() @Min(0) discountPercent?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Zapatillas Nike Air Max 2025' })
  @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción' })
  @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ example: 300.00 })
  @IsOptional() @IsNumber() @Min(0) price?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional() @IsInt() @Min(0) stock?: number;

  @ApiPropertyOptional({ example: 'uuid-de-la-categoria' })
  @IsOptional() @IsUUID() categoryId?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional() @IsString() imageUrl?: string;

  @ApiPropertyOptional({ type: [String], description: 'URLs de imágenes adicionales del producto' })
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({ example: 15, nullable: true })
  @IsOptional() @IsInt() @Min(0) discountPercent?: number | null;
}

export class ListProductsQueryDto {
  @ApiPropertyOptional({ example: 'uuid-de-la-categoria' })
  @IsOptional() @IsUUID() categoryId?: string;

  @ApiPropertyOptional({ example: 'nike' })
  @IsOptional() @IsString() search?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;

  @ApiPropertyOptional({ example: 0, description: 'Cantidad de registros a omitir' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip?: number;

  @ApiPropertyOptional({ example: 20, description: 'Cantidad de registros a retornar' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) take?: number;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Calzado' })
  @IsString() @IsNotEmpty() name!: string;

  @ApiPropertyOptional({ example: 'Zapatos, zapatillas y sandalias' })
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
  images: string[];
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
