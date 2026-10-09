import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Static file serving for uploads
  // Determine uploads directory relative to backend root (not cwd)
  const backendRoot = join(__dirname, '..'); // __dirname = dist/, .. = backend root
  const uploadsPath = join(backendRoot, 'uploads');
  const express = (await import('express')).default;
  
  // Configure static file serving with aggressive caching
  // Images rarely change, so we can cache them for a long time
  app.use('/uploads', express.static(uploadsPath, {
    maxAge: 31536000000, // 1 year in milliseconds
    immutable: true,     // Files never change (filename-based caching)
    index: false,
    cacheControl: true,  // Enable Cache-Control headers
    etag: true,          // Enable ETag for validation
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Medikom Plus API')
    .setDescription('API documentation for Medikom Plus')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
