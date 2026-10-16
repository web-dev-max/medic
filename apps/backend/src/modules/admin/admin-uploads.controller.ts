import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UploadedFiles,
  FileTypeValidator,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { ProductsAdminService } from './products-admin.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

function generateUniqueFilename(originalname: string): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const ext = extname(originalname);
  return `${timestamp}-${randomString}${ext}`;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/uploads')
export class AdminUploadsController {
  private readonly IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || '/uploads/images';

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private convertToRelativeUrl(absolutePath: string): string {
    if (!absolutePath) return '';
    
    if (absolutePath.startsWith('http')) {
      return absolutePath;
    }
    
    if (absolutePath.startsWith('/uploads/')) {
      return absolutePath;
    }
    
    const cleanPath = absolutePath.startsWith('/') ? absolutePath : '/' + absolutePath;
    return cleanPath.replace(this.IMAGE_BASE_URL, '/uploads/images');
  }

  @Post('product/:productId')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async uploadProductImages(
    @Param('productId') productId: string,
    @Request() req: any,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/i,
          }),
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Check if product exists
    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const uploadedItems: Array<{ url: string; mediaId: number }> = [];

    for (const file of files) {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      const destPath = join(__dirname, '../../../uploads/images', uniqueFilename);

      // Ensure directory exists
      if (!existsSync(join(__dirname, '../../../uploads/images'))) {
        const fs = await import('fs');
        fs.mkdirSync(join(__dirname, '../../../uploads/images'), { recursive: true });
      }

      // Write file
      const writeStream = createWriteStream(destPath);
      await new Promise<void>((resolve, reject) => {
        writeStream.write(file.buffer);
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (error) => reject(error));
      });

      // Create relative URL
      const relativeUrl = `/uploads/images/${uniqueFilename}`;

      // Insert into jos_virtuemart_medias
      const mediaResult = await this.dataSource.query(
        `INSERT INTO jos_virtuemart_medias (
          virtuemart_vendor_id, file_title, file_class, file_type,
          file_url, file_url_thumb, file_is_product_image, published
        ) VALUES (1, ?, 'product', 'image', ?, '', 1, 1)`,
        [file.originalname, relativeUrl]
      );

      const mediaId = mediaResult.insertId;

      // Insert into jos_virtuemart_product_medias
      await this.dataSource.query(
        `INSERT INTO jos_virtuemart_product_medias (
          virtuemart_product_id, virtuemart_media_id, ordering
        ) VALUES (?, ?, ?)`,
        [Number(productId), mediaId, 0]
      );
      
      uploadedItems.push({ url: relativeUrl, mediaId });
    }

    return {
      message: 'Images uploaded successfully',
      items: uploadedItems,
    };
  }

  @Delete('product/:productId/:mediaId')
  async deleteProductImage(
    @Param('productId') productId: string,
    @Param('mediaId') mediaId: string,
  ) {
    // Check if product exists
    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get image info
    const imageResult = await this.dataSource.query(
      `SELECT med.file_url, pm.id
       FROM jos_virtuemart_product_medias pm
       INNER JOIN jos_virtuemart_medias med ON pm.virtuemart_media_id = med.virtuemart_media_id
       WHERE pm.virtuemart_product_id = ? AND pm.virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)]
    );

    if (imageResult.length === 0) {
      throw new NotFoundException('Image not found for this product');
    }

    const imageInfo = imageResult[0];

    // Delete from product_medias
    await this.dataSource.query(
      `DELETE FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? AND virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)]
    );

    // Check if any other products use this media
    const otherProductCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM jos_virtuemart_product_medias WHERE virtuemart_media_id = ?`,
      [Number(mediaId)]
    );

    // If no other products use this media, delete the media record and file
    if (parseInt(otherProductCount[0].count) === 0) {
      // Delete physical file
      const filePath = join(__dirname, '../../../', imageInfo.file_url);
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (error) {
          console.error('Failed to delete file:', error);
        }
      }

      // Delete from medias
      await this.dataSource.query(
        `DELETE FROM jos_virtuemart_medias WHERE virtuemart_media_id = ?`,
        [Number(mediaId)]
      );
    }

    return {
      message: 'Image deleted successfully',
    };
  }

  @Post('product/:productId/set-main/:mediaId')
  async setMainImage(
    @Param('productId') productId: string,
    @Param('mediaId') mediaId: string,
  ) {
    // Check if product exists
    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if media belongs to product
    const mediaCheck = await this.dataSource.query(
      `SELECT id FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? AND virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)]
    );

    if (mediaCheck.length === 0) {
      throw new NotFoundException('Image not found for this product');
    }

    // Get all images for this product
    const allImages = await this.dataSource.query(
      `SELECT id, virtuemart_media_id FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? ORDER BY ordering ASC`,
      [Number(productId)]
    );

    // Update ordering: set the selected image to ordering 0, others increment
    for (let i = 0; i < allImages.length; i++) {
      const newOrdering = allImages[i].virtuemart_media_id === Number(mediaId) ? 0 : i + 1;
      await this.dataSource.query(
        `UPDATE jos_virtuemart_product_medias SET ordering = ? WHERE id = ?`,
        [newOrdering, allImages[i].id]
      );
    }

    return {
      message: 'Main image set successfully',
    };
  }
}
