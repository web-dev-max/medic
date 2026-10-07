import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Mercury M200' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'mercury-m200' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Описание товара' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  oldPrice?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  brandId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  specifications?: Record<string, string>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoCanonical?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProductDto extends OmitType(CreateProductDto, [
  'categoryId',
  'brandId',
] as const) {}
