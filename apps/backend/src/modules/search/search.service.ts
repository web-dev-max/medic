import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface SearchResult {
  products: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
    brand?: { name: string };
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    image?: string;
  }>;
  total: {
    products: number;
    categories: number;
  };
}

@Injectable()
export class SearchService {
  constructor(private readonly dataSource: DataSource) {}

  async globalSearch(query: string, limit: number = 10): Promise<SearchResult> {
    if (!query || query.trim().length === 0) {
      return { products: [], categories: [], total: { products: 0, categories: 0 } };
    }

    const searchParam = `%${query}%`;

    // Search products by name, short description, and slug
    const productsSql = `
      SELECT 
        p.virtuemart_product_id AS id,
        pr.product_name AS name,
        pr.slug AS slug,
        pp.product_price AS price,
        m.mf_name AS brandName
      FROM jos_virtuemart_products p
      INNER JOIN jos_virtuemart_products_ru_ru pr 
        ON p.virtuemart_product_id = pr.virtuemart_product_id
      LEFT JOIN jos_virtuemart_product_prices pp 
        ON p.virtuemart_product_id = pp.virtuemart_product_id 
        AND pp.virtuemart_shoppergroup_id = 0
      LEFT JOIN jos_virtuemart_product_manufacturers pm 
        ON p.virtuemart_product_id = pm.virtuemart_product_id
      LEFT JOIN jos_virtuemart_manufacturers_ru_ru m 
        ON pm.virtuemart_manufacturer_id = m.virtuemart_manufacturer_id
      WHERE p.published = 1
        AND (
          pr.product_name LIKE ? 
          OR pr.product_s_desc LIKE ?
          OR pr.slug LIKE ?
        )
      ORDER BY p.pordering ASC
      LIMIT ?
    `;

    // Search categories by name or slug
    const categoriesSql = `
      SELECT 
        c.virtuemart_category_id AS id,
        cr.category_name AS name,
        cr.slug AS slug,
        cr.category_description AS description,
        mm.file_url AS image
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr 
        ON c.virtuemart_category_id = cr.virtuemart_category_id
      LEFT JOIN jos_virtuemart_category_medias cm 
        ON c.virtuemart_category_id = cm.virtuemart_category_id
      LEFT JOIN jos_virtuemart_medias mm 
        ON cm.virtuemart_media_id = mm.virtuemart_media_id 
        AND mm.published = 1
      WHERE c.shared = 0 
        AND c.published = 1
        AND (
          LOWER(cr.category_name) LIKE LOWER(?) 
          OR LOWER(cr.slug) LIKE LOWER(?)
        )
      GROUP BY c.virtuemart_category_id, cr.category_name, cr.slug, 
               cr.category_description, mm.file_url
      ORDER BY c.ordering ASC
      LIMIT ?
    `;

    // Execute both queries in parallel
    const [productsRaw, categoriesRaw] = await Promise.all([
      this.dataSource.query(productsSql, [searchParam, searchParam, searchParam, limit]),
      this.dataSource.query(categoriesSql, [searchParam, searchParam, limit]),
    ]);

    // Fetch images for products
    const productIds = productsRaw.map((p: any) => p.id).filter(Boolean);
    const imagesMap = new Map<number, string>();
    
    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const imagesSql = `
        SELECT pm.virtuemart_product_id, med.file_url
        FROM jos_virtuemart_product_medias pm
        INNER JOIN jos_virtuemart_medias med 
          ON pm.virtuemart_media_id = med.virtuemart_media_id
        WHERE pm.virtuemart_product_id IN (${placeholders})
          AND med.published = 1
        ORDER BY pm.virtuemart_product_id ASC, pm.ordering ASC
      `;
      const imagesResult = await this.dataSource.query(imagesSql, productIds);

      imagesResult.forEach((img: any) => {
        const pid = img.virtuemart_product_id;
        if (!imagesMap.has(pid)) {
          imagesMap.set(pid, img.file_url);
        }
      });
    }

    // Process products
    const imageBaseUrl = process.env.IMAGE_BASE_URL || 'http://localhost:3001/uploads/images';
    const products = productsRaw.map((item: any) => {
      let image = imagesMap.get(Number(item.id)) || null;
      
      // Convert image URL to absolute
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      return {
        id: Number(item.id),
        name: item.name || '',
        slug: item.slug || '',
        price: item.price ? parseFloat(item.price) : 0,
        images: image ? [image] : [],
        brand: item.brandName ? { name: item.brandName } : undefined,
      };
    });

    // Process categories
    const categories = categoriesRaw.map((row: any) => {
      let image = row.image || null;
      
      // Convert image URL to absolute
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      return {
        id: Number(row.id),
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        image,
      };
    });

    return {
      products,
      categories,
      total: {
        products: products.length,
        categories: categories.length,
      },
    };
  }
}
