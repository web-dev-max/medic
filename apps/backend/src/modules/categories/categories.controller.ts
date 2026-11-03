import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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

  @Get('catalog')
  @ApiOperation({ summary: 'Get all categories for catalog page (with product count and image fallback)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findCatalog(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.categoriesService.findCatalog(isNaN(pageNum) ? 1 : pageNum, isNaN(limitNum) ? 12 : limitNum);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search categories by name or slug' })
  searchCategories(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return { items: [], total: 0 };
    }
    return this.categoriesService.searchCategories(query.trim());
  }

  @Get(':parentId/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a category' })
  findSubCategories(@Param('parentId') parentId: string) {
    return this.categoriesService.findSubCategories(Number(parentId));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findOne(@Param('slug') slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    return this.categoriesService.findOne(decodedSlug);
  }

  @Get(':slug/path')
  @ApiOperation({ summary: 'Get category path (breadcrumbs) by slug' })
  getCategoryPath(@Param('slug') slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    return this.categoriesService.getCategoryPath(decodedSlug);
  }
}
