import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('homepage')
  @ApiOperation({ summary: 'Get categories for homepage (with images, max 8)' })
  findHomepage() {
    return this.categoriesService.findAllHomepage();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findOne(@Param('slug') slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    return this.categoriesService.findOne(decodedSlug);
  }

  @Get(':parentId/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a category' })
  findSubCategories(@Param('parentId') parentId: string) {
    return this.categoriesService.findSubCategories(Number(parentId));
  }
}
