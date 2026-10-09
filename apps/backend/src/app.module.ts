import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { databaseConfig } from './config/database.config';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ContentModule } from './modules/content/content.module';
import { SeoModule } from './modules/seo/seo.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';

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

        entities: [
          join(__dirname, '../modules/**/*.entity{.ts,.js}'),
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
  ],
})
export class AppModule {}
