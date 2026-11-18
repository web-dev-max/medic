import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, MinLength, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
  @Type(() => Number) // 👈 превращает "0" в 0
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

  // 👇 ДОБАВЛЕНО: Фронт присылает это поле, а DTO его не пропускал
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  // 👇 Улучшено: защита от того, что фронт может прислать "0", "1" или 1, 0
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 1 || value === '1')
  published?: boolean;

  // 👇 ДОБАВЛЕНО: @Type(() => Number), иначе строка "10" не пройдет валидацию
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ordering?: number;
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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ordering?: number;
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
