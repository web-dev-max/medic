import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CategoriesAdminService } from './categories-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCreateCategoryDto, AdminUpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private categoriesAdminService: CategoriesAdminService) {}

  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesAdminService.findAll(query);
  }

  @Get('tree')
  async findTree() {
    return this.categoriesAdminService.findTree();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesAdminService.findById(Number(id));
  }

  @Post()
  async create(@Body() data: AdminCreateCategoryDto, @Request() req: any) {
    return this.categoriesAdminService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: AdminUpdateCategoryDto, @Request() req: any) {
    return this.categoriesAdminService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriesAdminService.delete(Number(id));
  }
}
