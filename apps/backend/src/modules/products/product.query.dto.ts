import { IsOptional, IsString, IsNumber, IsIn, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  // Custom field filters (by custom field ID)
  @ApiProperty({ required: false, description: 'Filter by custom field ID (format: fieldId:value)' })
  @IsOptional()
  @IsString()
  customFilter?: string;

  @ApiProperty({ required: false, description: 'List of custom field values for current category' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customFieldValues?: string[];

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 12 })
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 12;

  @ApiProperty({ required: false, enum: ['name', 'price', 'createdAt'] })
  @IsOptional()
  @IsIn(['name', 'price', 'createdAt'])
  sortBy?: 'name' | 'price' | 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
