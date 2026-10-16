import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  virtuemart_category_id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  virtuemart_manufacturer_id?: number;

  @IsNotEmpty()
  @IsString()
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  oldPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoCanonical?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;
}

export class AdminUpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  virtuemart_category_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  virtuemart_manufacturer_id?: number;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  oldPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoCanonical?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;
}

export class ProductQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  brandId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';
}
