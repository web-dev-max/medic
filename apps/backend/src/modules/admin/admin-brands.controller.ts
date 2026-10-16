import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BrandsAdminService } from './brands-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCreateBrandDto, AdminUpdateBrandDto, BrandQueryDto } from './dto/brand.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private brandsAdminService: BrandsAdminService) {}

  @Get()
  async findAll(@Query() query: BrandQueryDto) {
    return this.brandsAdminService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.brandsAdminService.findById(Number(id));
  }

  @Post()
  async create(@Body() data: AdminCreateBrandDto, @Request() req: any) {
    return this.brandsAdminService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: AdminUpdateBrandDto, @Request() req: any) {
    return this.brandsAdminService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.brandsAdminService.delete(Number(id));
  }
}
