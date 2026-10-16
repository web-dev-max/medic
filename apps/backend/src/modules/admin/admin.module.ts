import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { ProductsAdminService } from './products-admin.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesAdminService } from './categories-admin.service';
import { AdminBrandsController } from './admin-brands.controller';
import { BrandsAdminService } from './brands-admin.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdminUploadsController } from './admin-uploads.controller';
import { AdminContentController } from './admin-content.controller';
import { ContentAdminService } from './content-admin.service';
import { DataSource } from 'typeorm';

@Module({
  controllers: [
    AdminProductsController,
    AdminCategoriesController,
    AdminBrandsController,
    AdminDashboardController,
    AdminUploadsController,
    AdminContentController,
  ],
  providers: [
    ProductsAdminService,
    CategoriesAdminService,
    BrandsAdminService,
    DashboardService,
    ContentAdminService,
  ],
  exports: [ProductsAdminService, CategoriesAdminService, BrandsAdminService, DashboardService, ContentAdminService],
})
export class AdminModule {}
