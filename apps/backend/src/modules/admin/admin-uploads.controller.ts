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
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname, join, resolve, dirname } from 'path';
import { promises as fs, existsSync, unlinkSync, mkdirSync } from 'fs';
import { ProductsAdminService } from './products-admin.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

const logger = new Logger('AdminUploadsController');

function resolveUploadsRoot(): string {
  if (process.env.UPLOADS_DIR) return resolve(process.env.UPLOADS_DIR);
  if (existsSync('/app/apps/backend')) return '/app/apps/backend/uploads';

  let dir = resolve(process.cwd());
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'apps', 'backend'))) {
      return join(dir, 'apps', 'backend', 'uploads');
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return join(process.cwd(), 'uploads');
}

const UPLOADS_ROOT       = resolveUploadsRoot();
const PRODUCT_IMAGES_DIR = join(UPLOADS_ROOT, 'images', 'stories', 'virtuemart', 'product');
const PRODUCT_URL_PREFIX = '/uploads/images/stories/virtuemart/product';

mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
logger.log(`[UPLOADS] root=${UPLOADS_ROOT} product=${PRODUCT_IMAGES_DIR}`);

function generateUniqueFilename(originalname: string): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const ext = extname(originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!allowedExts.includes(ext)) {
    throw new BadRequestException(`Invalid file extension: ${ext}`);
  }
  return `${timestamp}-${randomString}${ext}`;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/uploads')
export class AdminUploadsController {
  constructor(
    private readonly productsAdminService: ProductsAdminService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Post('product/:productId')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async uploadProductImages(
    @Param('productId') productId: string,
    @UploadedFiles(new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
      ],
      fileIsRequired: false,
    })) files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) throw new NotFoundException('Product not found');

    if (!existsSync(PRODUCT_IMAGES_DIR)) {
      mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
    }

    const uploadedItems: Array<{ url: string; mediaId: number }> = [];

    for (const file of files) {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      const destPath       = join(PRODUCT_IMAGES_DIR, uniqueFilename);
      const relativeUrl    = `${PRODUCT_URL_PREFIX}/${uniqueFilename}`;

      try {
        await fs.writeFile(destPath, file.buffer);

        const mediaResult = await this.dataSource.query(
          `INSERT INTO jos_virtuemart_medias (
             virtuemart_vendor_id, file_title, file_class, file_type,
             file_url, file_url_thumb, file_is_product_image, published,
             created_on, created_by, modified_on, modified_by,
             locked_on, locked_by
           ) VALUES (
             1, ?, 'product', 'image',
             ?, '', 1, 1,
             NOW(), 0, NOW(), 0,
             '1970-01-01 00:00:00', 0
           )`,
          [file.originalname, relativeUrl],
        );
        const mediaId = mediaResult.insertId;

        await this.dataSource.query(
          `INSERT INTO jos_virtuemart_product_medias (virtuemart_product_id, virtuemart_media_id, ordering)
           VALUES (?, ?, ?)`,
          [Number(productId), mediaId, 0],
        );

        uploadedItems.push({ url: relativeUrl, mediaId });
        logger.log(`Uploaded: ${relativeUrl} for product ${productId}`);
      } catch (err: any) {
        try { await fs.unlink(destPath); } catch {}
        logger.error(`Upload failed for ${uniqueFilename}: ${err.message}`);
        throw new BadRequestException(`Failed to save image: ${err.message}`);
      }
    }

    return { message: 'Images uploaded successfully', items: uploadedItems };
  }

  @Delete('product/:productId/:mediaId')
  async deleteProductImage(
    @Param('productId') productId: string,
    @Param('mediaId') mediaId: string,
  ) {
    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) throw new NotFoundException('Product not found');

    const imageResult = await this.dataSource.query(
      `SELECT med.file_url, pm.id
       FROM jos_virtuemart_product_medias pm
       INNER JOIN jos_virtuemart_medias med ON pm.virtuemart_media_id = med.virtuemart_media_id
       WHERE pm.virtuemart_product_id = ? AND pm.virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)],
    );
    if (imageResult.length === 0) throw new NotFoundException('Image not found for this product');
    const imageInfo = imageResult[0];

    await this.dataSource.query(
      `DELETE FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? AND virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)],
    );

    const other = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM jos_virtuemart_product_medias WHERE virtuemart_media_id = ?`,
      [Number(mediaId)],
    );

    if (parseInt(other[0].count) === 0) {
      const relPath  = imageInfo.file_url.replace(/^\/?uploads\//, '');
      const filePath = join(UPLOADS_ROOT, relPath);

      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
          logger.log(`Deleted file: ${filePath}`);
        } catch (err: any) {
          logger.error(`Failed to delete file: ${err.message}`);
        }
      } else {
        logger.warn(`File not found: ${filePath}`);
      }

      await this.dataSource.query(
        `DELETE FROM jos_virtuemart_medias WHERE virtuemart_media_id = ?`,
        [Number(mediaId)],
      );
    }

    return { message: 'Image deleted successfully' };
  }

  @Post('product/:productId/set-main/:mediaId')
  async setMainImage(
    @Param('productId') productId: string,
    @Param('mediaId') mediaId: string,
  ) {
    const product = await this.productsAdminService.findById(Number(productId));
    if (!product) throw new NotFoundException('Product not found');

    const mediaCheck = await this.dataSource.query(
      `SELECT id FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? AND virtuemart_media_id = ?`,
      [Number(productId), Number(mediaId)],
    );
    if (mediaCheck.length === 0) throw new NotFoundException('Image not found for this product');

    const allImages = await this.dataSource.query(
      `SELECT id, virtuemart_media_id FROM jos_virtuemart_product_medias WHERE virtuemart_product_id = ? ORDER BY ordering ASC`,
      [Number(productId)],
    );

    for (let i = 0; i < allImages.length; i++) {
      const newOrdering = allImages[i].virtuemart_media_id === Number(mediaId) ? 0 : i + 1;
      await this.dataSource.query(
        `UPDATE jos_virtuemart_product_medias SET ordering = ? WHERE id = ?`,
        [newOrdering, allImages[i].id],
      );
    }

    return { message: 'Main image set successfully' };
  }
}
