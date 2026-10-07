import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './product.query.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findOne(@Param('slug') slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    console.log('[ProductsController.findOne] Decoded slug:', decodedSlug);
    return this.productsService.findOne(decodedSlug);
  }

  @Get('filters/custom-fields')
  @ApiOperation({ summary: 'Get available custom field values for category filtering' })
  getCustomFieldValues(@Query('categoryId') categoryId: number, @Query('customFieldId') customFieldId?: number) {
    return this.productsService.getCustomFieldValues(Number(categoryId), customFieldId ? Number(customFieldId) : undefined);
  }
}
