import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from './modules/auth/admin-user.entity';
import { Product } from './modules/products/product.entity';
import { Category } from './modules/categories/category.entity';
import { Brand } from './modules/brands/brand.entity';
import { RequestEntity } from './modules/requests/request.entity';
import { ContentPage } from './modules/content/content-page.entity';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ContentModule } from './modules/content/content.module';
import { SeoModule } from './modules/seo/seo.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        charset: 'utf8mb4',
        extra: {
          charset: 'UTF8MB4_GENERAL_CI',
          connectTimeout: 10000,
        },

        entities: [
          AdminUser,
          Product,
          Category,
          Brand,
          RequestEntity,
          ContentPage,
        ],

        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    RequestsModule,
    ContentModule,
    SeoModule,
    AuthModule,
    MailModule,
    AdminModule,
  ],
})
export class AppModule {}
