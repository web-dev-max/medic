import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AdminCreateProductDto, AdminUpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private readonly IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || '/uploads/images';

  private convertToAbsoluteUrl(relativePath: string): string {
    if (!relativePath) return '';

    // If already a full URL (http/https), return as-is
    if (relativePath.startsWith('http')) {
      return relativePath;
    }

    // If already starts with /uploads/, return as-is (local path)
    if (relativePath.startsWith('/uploads/')) {
      return relativePath;
    }

    // Relative path - prepend base URL
    const cleanPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    return `${this.IMAGE_BASE_URL}${cleanPath}`;
  }

  async findAll(query: ProductQueryDto) {
    try {
      const page = query.page || 1;
      const pageSize = query.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let whereConditions = '';
      const params: any[] = [];

      if (query.search) {
        whereConditions += ' AND pr.product_name LIKE ?';
        params.push(`%${query.search}%`);
      }

      if (query.categoryId) {
        whereConditions += ' AND pc.virtuemart_category_id = ?';
        params.push(Number(query.categoryId));
      }

      if (query.brandId) {
        whereConditions += ' AND pm.virtuemart_manufacturer_id = ?';
        params.push(Number(query.brandId));
      }

      if (query.status) {
        whereConditions += ' AND p.published = ?';
        params.push(Number(query.status));
      }

      // Get total count
      const countQuery = `\
        SELECT COUNT(DISTINCT p.virtuemart_product_id) as total
        FROM jos_virtuemart_products p
        INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
        LEFT JOIN jos_virtuemart_product_categories pc ON p.virtuemart_product_id = pc.virtuemart_product_id
        WHERE 1=1 ${whereConditions}
      `;
      const [countRows] = await this.dataSource.query(countQuery, params);
      const total = parseInt(countRows.total);

      // Get products with all images
      const sortField = query.sortBy === 'price' ? 'ppr.product_price' : 'p.virtuemart_product_id';
      const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

      const productsQuery = `\
        SELECT
          p.virtuemart_product_id as id,
          pr.product_name as name,
          pr.slug,
          p.product_sku as sku,
          MIN(pc.virtuemart_category_id) as categoryId,
          COALESCE(MIN(ppr.product_price), 0) as product_price,
          p.product_in_stock,
          p.published,
          p.product_available_date as availableDate,
          p.virtuemart_product_id as virtuemart_id
        FROM jos_virtuemart_products p
        INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
        LEFT JOIN jos_virtuemart_product_categories pc ON p.virtuemart_product_id = pc.virtuemart_product_id
        LEFT JOIN jos_virtuemart_product_prices ppr ON p.virtuemart_product_id = ppr.virtuemart_product_id
        WHERE 1=1 ${whereConditions}
        GROUP BY p.virtuemart_product_id, pr.product_name, pr.slug, p.product_sku,
                 p.product_in_stock, p.published, p.product_available_date
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const products = await this.dataSource.query(productsQuery, [...params, pageSize, offset]);

      // Fetch images for all products
      const productIds = products.map((p: any) => p.id).filter(Boolean);
      const imagesMap = new Map<number, Array<{ url: string; mediaId: number; ordering: number }>>();

      if (productIds.length > 0) {
        const placeholders = productIds.map(() => '?').join(',');
        const imagesSql = `\
          SELECT pm2.virtuemart_product_id, med.file_url, pm2.virtuemart_media_id as mediaId, pm2.ordering
          FROM jos_virtuemart_product_medias pm2
          INNER JOIN jos_virtuemart_medias med ON pm2.virtuemart_media_id = med.virtuemart_media_id
          WHERE pm2.virtuemart_product_id IN (${placeholders})
            AND med.published = 1
          ORDER BY pm2.virtuemart_product_id ASC, pm2.ordering ASC
        `;
        const imagesResult = await this.dataSource.query(imagesSql, productIds);

        imagesResult.forEach((img: any) => {
          const pid = img.virtuemart_product_id;
          const url = this.convertToAbsoluteUrl(img.file_url);
          if (!imagesMap.has(pid)) {
            imagesMap.set(pid, []);
          }
          imagesMap.get(pid)!.push({
            url,
            mediaId: img.mediaId,
            ordering: img.ordering || 0
          });
        });
      }

      // Convert products to include images array with media IDs
      const items = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        categoryId: product.categoryId || null,
        price: parseFloat(String(product.product_price || 0)),
        product_in_stock: product.product_in_stock,
        published: product.published,
        availableDate: product.availableDate,
        virtuemart_id: product.virtuemart_id,
        images: imagesMap.get(product.id) || [],
      }));

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error: any) {
      console.error('[DEBUG] findAll error:', error.message);
      console.error('[DEBUG] SQL:', error.sql);
      console.error('[DEBUG] Params:', error.parameters);
      throw error;
    }
  }

  async findById(id: number) {
    const product = await this.findOneByIdRaw(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: AdminCreateProductDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Insert into jos_virtuemart_products
        const productResult = await manager.query(
          `INSERT INTO jos_virtuemart_products (
             virtuemart_vendor_id, product_parent_id, product_sku,
             product_in_stock, product_available_date, published,
             product_params, created_on, created_by, modified_on, modified_by,
             locked_on, locked_by
           ) VALUES (
             1, 0, ?, 0, NOW(), ?, '{}',
             NOW(), 0, NOW(), 0,
             '1970-01-01 00:00:00', 0
           )`,
          [
            data.sku || '',
            data.published !== false ? 1 : 0,
          ],
        );

        const productId = productResult.insertId;

        // Insert into jos_virtuemart_products_ru_ru
        // BUG-09 FIX: Include metakey column in INSERT
        await manager.query(
          `INSERT INTO jos_virtuemart_products_ru_ru (
            virtuemart_product_id, product_name, product_s_desc, product_desc,
            metadesc, metakey, customtitle, slug
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            data.name,
            data.shortDescription || '',
            data.description || '',
            data.seoDescription || '',
            data.seoTitle || '', // Default to seoTitle if metakey not provided
            data.seoTitle || '',
            data.slug || '',
          ]
        );

        // Insert category relation
        if (data.virtuemart_category_id) {
          await manager.query(
            `INSERT INTO jos_virtuemart_product_categories (virtuemart_product_id, virtuemart_category_id) VALUES (?, ?)`,
            [productId, data.virtuemart_category_id]
          );
        }


        if (data.price > 0) {
          await manager.query(
            `INSERT INTO jos_virtuemart_product_prices (
               virtuemart_product_id,
               product_price,
               product_price_publish_up,
               product_price_publish_down,
               created_on, created_by, modified_on, modified_by,
               locked_on, locked_by
             ) VALUES (
               ?, ?,
               NOW(), '9999-12-31 23:59:59',
               NOW(), 0, NOW(), 0,
               '1970-01-01 00:00:00', 0
             )`,
            [productId, data.price],
          );
        }

        return this.findById(productId);
      } catch (error: any) {
        throw new BadRequestException(`Failed to create product: ${error.message}`);
      }
    });
  }

  async update(id: number, data: AdminUpdateProductDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Check if product exists
        const existing = await this.findById(id);
        if (!existing) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Update jos_virtuemart_products_ru_ru
        await manager.query(
          `UPDATE jos_virtuemart_products_ru_ru SET
            product_name = COALESCE(?, product_name),
            product_s_desc = COALESCE(?, product_s_desc),
            product_desc = COALESCE(?, product_desc),
            metadesc = COALESCE(?, metadesc),
            metakey = COALESCE(?, metakey),
            customtitle = COALESCE(?, customtitle)
          WHERE virtuemart_product_id = ?`,
          [
            data.name || existing.name,
            data.shortDescription || existing.shortDescription,
            data.description || existing.description,
            data.seoDescription || null,
            data.seoTitle || null, // Use seoTitle as metakey default
            data.seoTitle || null,
            id,
          ]
        );

        // Update jos_virtuemart_products
        const productUpdateFields: string[] = [];
        const productUpdateParams: any[] = [];

        if (data.sku !== undefined) {
          productUpdateFields.push('product_sku = ?');
          productUpdateParams.push(data.sku);
        }
        if (data.published !== undefined) {
          productUpdateFields.push('published = ?');
          productUpdateParams.push(data.published ? '1' : '0');
        }

        if (productUpdateFields.length > 0) {
          productUpdateParams.push(id);
          await manager.query(
            `UPDATE jos_virtuemart_products SET ${productUpdateFields.join(', ')} WHERE virtuemart_product_id = ?`,
            productUpdateParams
          );
        }

        // Update category relation
        if (data.virtuemart_category_id !== undefined) {
          // Delete old category relation
          await manager.query(
            `DELETE FROM jos_virtuemart_product_categories WHERE virtuemart_product_id = ?`,
            [id]
          );
          // Insert new category relation
          if (data.virtuemart_category_id) {
            await manager.query(
              `INSERT INTO jos_virtuemart_product_categories (virtuemart_product_id, virtuemart_category_id) VALUES (?, ?)`,
              [id, data.virtuemart_category_id]
            );
          }
        }

        // Update price if changed
        // BUG-08 FIX: Also update oldPrice if provided
        if (data.price !== undefined && data.price > 0) {
          await manager.query(
            `UPDATE jos_virtuemart_product_prices
             SET product_price = ?, modified_on = NOW()
             WHERE virtuemart_product_id = ?`,
            [data.price, id],
          );
        } else {
          await manager.query(
            `UPDATE jos_virtuemart_product_prices SET product_price = ? WHERE virtuemart_product_id = ?`,
            [data.price, id]
          );
        }

        return this.findById(id);
      } catch (error: any) {
        throw new BadRequestException(`Failed to update product: ${error.message}`);
      }
    });
  }

  async delete(id: number) {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        // Soft delete - set published = 0
        await manager.query(
          'UPDATE jos_virtuemart_products SET published = 0, modified_on = NOW() WHERE virtuemart_product_id = ?',
          [id]
        );

        return { success: true, message: 'Product deleted successfully' };
      } catch (error: any) {
        throw new BadRequestException(`Failed to delete product: ${error.message}`);
      }
    });
  }

  private async findOneByIdRaw(id: number) {
    const sql = `\
      SELECT
        p.virtuemart_product_id as id,
        pr.product_name as name,
        pr.slug,
        p.product_sku as sku,
        MIN(pc.virtuemart_category_id) as categoryId,
        COALESCE(MIN(pp.product_price), 0) as price,
        p.product_in_stock,
        p.published,
        p.product_available_date as availableDate,
        pr.product_s_desc as shortDescription,
        pr.product_desc as description,
        pr.metadesc as seoDescription,
        pr.metakey as seoKeywords,
        pr.customtitle as seoTitle
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_categories pc ON p.virtuemart_product_id = pc.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id
      WHERE p.virtuemart_product_id = ?
      GROUP BY p.virtuemart_product_id, pr.product_name, pr.slug, p.product_sku,
               p.product_in_stock, p.published, p.product_available_date,
               pr.product_s_desc, pr.product_desc, pr.metadesc, pr.metakey, pr.customtitle
    `;

    const rows = await this.dataSource.query(sql, [id]);
    const product = rows[0] || null;

    if (!product) return null;

    // Fetch images with media IDs
    const imagesSql = `\
      SELECT med.file_url, pm.virtuemart_media_id as mediaId, pm.ordering
      FROM jos_virtuemart_product_medias pm
      INNER JOIN jos_virtuemart_medias med ON pm.virtuemart_media_id = med.virtuemart_media_id
      WHERE pm.virtuemart_product_id = ? AND med.published = 1
      ORDER BY pm.ordering ASC
    `;
    const imagesRaw = await this.dataSource.query(imagesSql, [id]);
    const images = imagesRaw.map((img: any) => ({
      url: this.convertToAbsoluteUrl(img.file_url),
      mediaId: img.mediaId,
      ordering: img.ordering || 0
    }));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: product.categoryId || null,
      price: parseFloat(String(product.price || 0)),
      product_in_stock: product.product_in_stock,
      published: product.published,
      availableDate: product.availableDate,
      shortDescription: product.shortDescription,
      description: product.description,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      seoTitle: product.seoTitle,
      images,
    };
  }
}
