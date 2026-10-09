import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductQueryDto } from './product.query.dto';

@Injectable()
export class ProductsService {
  private readonly IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || '/uploads/images';

  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: ProductQueryDto) {
    const {
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      search,
      customFilter,
      page = 1,
      pageSize = 12,
      sortBy = 'pordering',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * pageSize;
    const sortMap: Record<string, string> = {
      name: 'pr.product_name',
      price: 'pp.product_price',
      createdAt: 'p.created_on',
    };
    const sortCol = sortMap[sortBy] || 'p.pordering';
    const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // MySQL2 uses positional placeholders (?) NOT named (:param)
    const whereConditions: string[] = ['p.published = 1'];
    const params: any[] = [];

    if (categoryId) {
      whereConditions.push(
        'EXISTS (SELECT 1 FROM jos_virtuemart_product_categories pc WHERE pc.virtuemart_product_id = p.virtuemart_product_id AND pc.virtuemart_category_id = ?)',
      );
      params.push(categoryId);
    }

    if (brandId) {
      whereConditions.push(
        'EXISTS (SELECT 1 FROM jos_virtuemart_product_manufacturers pm2 WHERE pm2.virtuemart_product_id = p.virtuemart_product_id AND pm2.virtuemart_manufacturer_id = ?)',
      );
      params.push(brandId);
    }

    if (minPrice !== undefined && minPrice !== null) {
      whereConditions.push('pp.product_price >= ?');
      params.push(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      whereConditions.push('pp.product_price <= ?');
      params.push(maxPrice);
    }

    if (search) {
      // OPTIMIZATION: Search ONLY by product name (not description, sku, etc.)
      // Case-insensitive search using MySQL LIKE with utf8mb4_unicode_ci collation
      whereConditions.push('pr.product_name LIKE ?');
      params.push(`%${search}%`);
    }

    // Custom field filter (format: fieldId:value1|value2|value3)
    if (customFilter) {
      const parts = customFilter.split(':');
      if (parts.length === 2) {
        const customFieldId = parts[0];
        const values = parts[1].split('|').filter(v => v.trim());
        
        if (values.length > 0) {
          const placeholders = values.map(() => '?').join(',');
          whereConditions.push(
            'EXISTS (SELECT 1 FROM jos_virtuemart_product_customfields pcf JOIN jos_virtuemart_customs c ON pcf.virtuemart_custom_id = c.virtuemart_custom_id WHERE pcf.virtuemart_product_id = p.virtuemart_product_id AND c.virtuemart_custom_id = ? AND pcf.customfield_value IN (' + placeholders + '))',
          );
          params.unshift(customFieldId, ...values);
        }
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Main query — pure SQL with positional placeholders
    const mainSql = `
      SELECT 
        p.virtuemart_product_id AS id,
        pr.product_name AS name,
        pr.slug AS slug,
        pr.product_desc AS description,
        pr.product_s_desc AS shortDescription,
        pp.product_price AS price,
        p.published AS isActive,
        p.pordering AS sortOrder,
        m.mf_name AS brandName
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm ON p.virtuemart_product_id = pm.virtuemart_product_id
      LEFT JOIN jos_virtuemart_manufacturers_ru_ru m ON pm.virtuemart_manufacturer_id = m.virtuemart_manufacturer_id
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(DISTINCT p.virtuemart_product_id) AS count
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm ON p.virtuemart_product_id = pm.virtuemart_product_id
      WHERE ${whereClause}
    `;

    // For count, we need params WITHOUT pagination
    const countParams = [...params];

    // For main query, params + pagination
    const mainParams = [...params, pageSize, skip];

    const [rawItems, totalRaw] = await Promise.all([
      this.dataSource.query(mainSql, mainParams),
      this.dataSource.query(countSql, countParams),
    ]);

    const total = parseInt(totalRaw[0]?.count || '0', 10);

    // OPTIMIZATION: Extract product IDs for images query
    const productIds = rawItems.map((item: any) => item.id).filter(Boolean);

    // OPTIMIZATION: Only fetch first image per product to reduce DB load
    // This significantly improves pagination performance for page > 1
    const imagesMap = new Map<number, string>();
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const imagesSql = `
        SELECT pm.virtuemart_product_id, med.file_url
        FROM jos_virtuemart_product_medias pm
        INNER JOIN jos_virtuemart_medias med ON pm.virtuemart_media_id = med.virtuemart_media_id
        WHERE pm.virtuemart_product_id IN (${placeholders})
          AND med.published = 1
        ORDER BY pm.virtuemart_product_id ASC, pm.ordering ASC
      `;
      const imagesResult = await this.dataSource.query(imagesSql, productIds);

      // Only take FIRST image per product (not all images)
      imagesResult.forEach((img: any) => {
        const pid = img.virtuemart_product_id;
        const url = this.convertToAbsoluteUrl(img.file_url);
        // Only store first image (key will be set only once)
        if (!imagesMap.has(pid)) {
          imagesMap.set(pid, url);
        }
      });
    }

    // Convert raw results to response format
    const items = rawItems.map((item: any) => ({
      id: Number(item.id),
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      shortDescription: item.shortDescription || '',
      price: item.price ? parseFloat(item.price) : 0,
      oldPrice: null,
      categoryId: null,
      brandId: null,
      brand: item.brandName ? { name: item.brandName } : null,
      images: imagesMap.get(Number(item.id)) ? [imagesMap.get(Number(item.id)!)!] : [], // Only first image
      isActive: item.isActive === 1,
      specifications: {},
    }));

    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(slug: string) {
    console.log('[ProductsService.findOne] Searching for slug:', slug);
    
    // Try 1: Exact slug match
    let productRaw = await this.dataSource.query(
      `SELECT 
        p.virtuemart_product_id AS id,
        pr.product_name AS name,
        pr.slug AS slug,
        pr.product_desc AS description,
        pr.product_s_desc AS shortDescription,
        pp.product_price AS price,
        p.published AS isActive,
        m.mf_name AS brandName
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm ON p.virtuemart_product_id = pm.virtuemart_product_id
      LEFT JOIN jos_virtuemart_manufacturers_ru_ru m ON pm.virtuemart_manufacturer_id = m.virtuemart_manufacturer_id
      WHERE p.published = 1 AND pr.slug = ?`,
      [slug],
    );

    if (productRaw[0]) {
      console.log('[ProductsService.findOne] Found by exact slug:', productRaw[0].slug);
      return this.buildProductResponse(productRaw[0]);
    }

    // Try 2: Case-insensitive match (in case of encoding issues)
    console.log('[ProductsService.findOne] Trying case-insensitive match...');
    productRaw = await this.dataSource.query(
      `SELECT 
        p.virtuemart_product_id AS id,
        pr.product_name AS name,
        pr.slug AS slug,
        pr.product_desc AS description,
        pr.product_s_desc AS shortDescription,
        pp.product_price AS price,
        p.published AS isActive,
        m.mf_name AS brandName
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm ON p.virtuemart_product_id = pm.virtuemart_product_id
      LEFT JOIN jos_virtuemart_manufacturers_ru_ru m ON pm.virtuemart_manufacturer_id = m.virtuemart_manufacturer_id
      WHERE p.published = 1 AND LOWER(pr.slug) = LOWER(?)`,
      [slug],
    );

    if (productRaw[0]) {
      console.log('[ProductsService.findOne] Found by case-insensitive match:', productRaw[0].slug);
      return this.buildProductResponse(productRaw[0]);
    }

    // Try 3: Search by product name (for Cyrillic slugs that might be stored differently)
    console.log('[ProductsService.findOne] Trying search by product name...');
    const nameMatch = await this.dataSource.query(
      `SELECT 
        p.virtuemart_product_id AS id,
        pr.product_name AS name,
        pr.slug AS slug,
        pr.product_desc AS description,
        pr.product_s_desc AS shortDescription,
        pp.product_price AS price,
        p.published AS isActive,
        m.mf_name AS brandName
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp ON p.virtuemart_product_id = pp.virtuemart_product_id AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm ON p.virtuemart_product_id = pm.virtuemart_product_id
      LEFT JOIN jos_virtuemart_manufacturers_ru_ru m ON pm.virtuemart_manufacturer_id = m.virtuemart_manufacturer_id
      WHERE p.published = 1 AND pr.product_name LIKE ?
      LIMIT 1`,
      [`%${slug}%`],
    );

    if (nameMatch[0]) {
      console.log('[ProductsService.findOne] Found by name match, using slug:', nameMatch[0].slug);
      return this.buildProductResponse(nameMatch[0]);
    }

    console.log('[ProductsService.findOne] Product not found:', slug);
    throw new NotFoundException(`Product not found: ${slug}`);
  }

  private async buildProductResponse(product: any) {
    // Fetch images separately
    const imagesRaw = await this.dataSource.query(
      `SELECT med.file_url, pm.ordering
      FROM jos_virtuemart_product_medias pm
      INNER JOIN jos_virtuemart_medias med ON pm.virtuemart_media_id = med.virtuemart_media_id
      WHERE pm.virtuemart_product_id = ? AND med.published = 1
      ORDER BY pm.ordering ASC`,
      [product.id],
    );

    const imageUrls = imagesRaw.map((img: any) => this.convertToAbsoluteUrl(img.file_url));

    return {
      id: Number(product.id),
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price ? parseFloat(product.price) : 0,
      oldPrice: null,
      categoryId: null,
      brandId: null,
      brand: product.brandName ? { name: product.brandName } : null,
      images: imageUrls,
      specifications: {},
      isActive: product.isActive === 1,
    };
  }

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

  /**
   * Get available custom field values for a category
   */
  async getCustomFieldValues(categoryId: number, customFieldId?: number) {
    let sql = `
      SELECT 
        c.virtuemart_custom_id AS fieldId,
        c.custom_title AS fieldTitle,
        c.custom_element AS fieldElement,
        pcf.customfield_value AS value,
        COUNT(DISTINCT pcf.virtuemart_product_id) AS productCount
      FROM jos_virtuemart_customs c
      INNER JOIN jos_virtuemart_product_customfields pcf ON c.virtuemart_custom_id = pcf.virtuemart_custom_id
      INNER JOIN jos_virtuemart_product_categories pc ON pcf.virtuemart_product_id = pc.virtuemart_product_id
      WHERE c.published = 1
        AND c.is_list >= 1
        AND pc.virtuemart_category_id = ?
    `;
    
    const params: any[] = [categoryId];

    if (customFieldId) {
      sql += ' AND c.virtuemart_custom_id = ?';
      params.push(customFieldId);
    }

    sql += ` GROUP BY c.virtuemart_custom_id, c.custom_title, c.custom_element, pcf.customfield_value
             HAVING productCount >= 1
             ORDER BY c.virtuemart_custom_id, productCount DESC`;

    const results = await this.dataSource.query(sql, params);

    // Group by field
    const fieldsMap = new Map<number, Array<{ fieldId: number; fieldTitle: string; fieldElement: string; value: string; productCount: number }>>();
    
    results.forEach((row: any) => {
      const fieldId = Number(row.fieldId);
      const entry = {
        fieldId,
        fieldTitle: row.fieldTitle || '',
        fieldElement: row.fieldElement || '',
        value: row.value || '',
        productCount: Number(row.productCount),
      };
      if (!fieldsMap.has(fieldId)) {
        fieldsMap.set(fieldId, [entry]);
      } else {
        fieldsMap.get(fieldId)!.push(entry);
      }
    });

    return Array.from(fieldsMap.values());
  }
}
