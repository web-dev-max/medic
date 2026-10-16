import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsAdminService } from './products-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCreateProductDto, AdminUpdateProductDto, ProductQueryDto } from './dto/product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private productsAdminService: ProductsAdminService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsAdminService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsAdminService.findById(Number(id));
  }

  @Post()
  async create(@Body() data: AdminCreateProductDto, @Request() req: any) {
    return this.productsAdminService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: AdminUpdateProductDto, @Request() req: any) {
    return this.productsAdminService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.productsAdminService.delete(Number(id));
  }
}
