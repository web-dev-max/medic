import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreateCategoryDto {
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  name: string;

  @IsNotEmpty({ message: 'Category code is required' })
  @IsString()
  @MinLength(1, { message: 'Category code cannot be empty' })
  @MaxLength(50, { message: 'Category code cannot exceed 50 characters' })
  categoryCode: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;
}

export class AdminUpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Category code cannot be empty' })
  @MaxLength(50, { message: 'Category code cannot exceed 50 characters' })
  categoryCode?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;
}

export class CategoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;
}
