import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get categories for homepage - only categories with images, max 8
   */
  async findAllHomepage() {
    const categories = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.virtuemart_category_id AS id',
        'cr.category_name AS name',
        'cr.slug AS slug',
        'cr.category_description AS description',
        'mm.file_url AS image',
        'ccp.category_parent_id AS parentId',
        'c.ordering AS sortOrder',
      ])
      .from('jos_virtuemart_categories', 'c')
      .innerJoin('jos_virtuemart_categories_ru_ru', 'cr', 'c.virtuemart_category_id = cr.virtuemart_category_id')
      .leftJoin('jos_virtuemart_category_categories', 'ccp', 'c.virtuemart_category_id = ccp.category_child_id')
      .leftJoin('jos_virtuemart_category_medias', 'cm', 'c.virtuemart_category_id = cm.virtuemart_category_id')
      .leftJoin('jos_virtuemart_medias', 'mm', 'cm.virtuemart_media_id = mm.virtuemart_media_id')
      .where('c.shared = 0')
      .andWhere('mm.file_url IS NOT NULL')
      .andWhere('mm.file_url != ""')
      .orderBy('ccp.ordering', 'ASC')
      .addOrderBy('c.ordering', 'ASC')
      .getRawMany();

    const imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '/uploads/images';

    // Convert relative path to absolute URL and deduplicate by category ID
    const uniqueCategories = new Map<number, any>();
    for (const c of categories) {
      if (!uniqueCategories.has(c.id)) {
        let image = c.image || null;
        if (image && imageBaseUrl) {
          // If already absolute URL or local uploads path, use as-is
          if (image.startsWith('http') || image.startsWith('/uploads/')) {
            // Keep as-is
          } else {
            // Relative path - prepend base URL
            image = imageBaseUrl + '/' + image.replace(/^\//, '');
          }
        }
        uniqueCategories.set(c.id, {
          id: Number(c.id),
          name: c.name || '',
          slug: c.slug || '',
          description: c.description || '',
          image,
          parentId: c.parentId ? Number(c.parentId) : null,
          sortOrder: Number(c.sortOrder) || 0,
        });
      }
    }

    // Convert to array and limit to 8
    return Array.from(uniqueCategories.values()).slice(0, 8);
  }

  async findAll() {
    const categories = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.virtuemart_category_id AS id',
        'cr.category_name AS name',
        'cr.slug AS slug',
        'cr.category_description AS description',
        'mm.file_url AS image',
        'ccp.category_parent_id AS parentId',
        'c.ordering AS sortOrder',
      ])
      .from('jos_virtuemart_categories', 'c')
      .innerJoin('jos_virtuemart_categories_ru_ru', 'cr', 'c.virtuemart_category_id = cr.virtuemart_category_id')
      .leftJoin('jos_virtuemart_category_categories', 'ccp', 'c.virtuemart_category_id = ccp.category_child_id')
      .leftJoin('jos_virtuemart_category_medias', 'cm', 'c.virtuemart_category_id = cm.virtuemart_category_id')
      .leftJoin('jos_virtuemart_medias', 'mm', 'cm.virtuemart_media_id = mm.virtuemart_media_id')
      .where('c.shared = 0')
      .orderBy('ccp.ordering', 'ASC')
      .addOrderBy('c.ordering', 'ASC')
      .getRawMany();

    const imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '/uploads/images';

    return categories.map((c) => {
      let image = c.image || null;
      // Convert relative path to absolute URL
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      return {
        id: Number(c.id),
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || '',
        image,
        parentId: c.parentId ? Number(c.parentId) : null,
        sortOrder: Number(c.sortOrder) || 0,
      };
    });
  }

  async findTree() {
    const categories = await this.findAll();

    const buildTree = (parentId: number | null = null): Array<{ id: number; name: string; slug: string; description: string; parentId: number | null; sortOrder: number; children: Array<{ id: number; name: string; slug: string; description: string; parentId: number | null; sortOrder: number; children: any[] }> }> => {
      return categories
        .filter((c) => c.parentId === parentId)
        .map((category) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  }

  async findOne(slug: string) {
    const category = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.virtuemart_category_id AS id',
        'cr.category_name AS name',
        'cr.slug AS slug',
        'cr.category_description AS description',
        'cr.metadesc AS seoDescription',
        'cr.metakey AS seoKeywords',
        'cr.customtitle AS seoTitle',
      ])
      .from('jos_virtuemart_categories', 'c')
      .innerJoin('jos_virtuemart_categories_ru_ru', 'cr', 'c.virtuemart_category_id = cr.virtuemart_category_id')
      .where('c.shared = 0')
      .andWhere('cr.slug = :slug', { slug })
      .getRawOne();

    if (!category) {
      throw new NotFoundException(`Category not found: ${slug}`);
    }

    return {
      id: Number(category.id),
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      seoTitle: category.seoTitle || category.name,
      seoDescription: category.seoDescription || '',
      seoKeywords: category.seoKeywords || '',
      isActive: true,
      sortOrder: 0,
    };
  }

  async findSubCategories(parentId: number) {
    const categories = await this.findAll();
    return categories.filter((c) => c.parentId === parentId);
  }

  /**
   * Search categories by name or slug.
   * Returns up to 5 matching categories for autocomplete.
   */
  async searchCategories(query: string, limit: number = 5) {
    const sql = `
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

    const searchParam = `%${query}%`;
    const results = await this.dataSource.query(sql, [searchParam, searchParam, limit]);

    const imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '/uploads/images';

    const items = results.map((row: any) => {
      let image = row.image || null;
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

    return { items, total: items.length };
  }

  /**
   * Get full category hierarchy path (breadcrumbs) by slug.
   * Returns array from root to current category, EXCLUDING root categories (parent_id=0).
   * Root categories are replaced by "Каталог" link on the frontend.
   */
  async getCategoryPath(slug: string): Promise<Array<{ id: number; name: string; slug: string }>> {
    // Get the category by slug
    const category: any = await this.dataSource.query(
      `SELECT c.virtuemart_category_id AS id, cr.category_name AS name, cr.slug AS slug
       FROM jos_virtuemart_categories c
       INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
       WHERE cr.slug = ?`,
      [slug]
    );

    if (!category || !category[0]) {
      return [];
    }

    // Build full path by traversing up the hierarchy using junction table
    const fullPath: Array<{ id: number; name: string; slug: string; isRoot: boolean }> = [];
    let currentId = Number(category[0].id);
    let currentCat = category[0];
    const visited = new Set<number>();

    // Collect categories from leaf to root
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);

      // Check if this is a root category (parent_id = 0)
      const parentRow: any = await this.dataSource.query(
        `SELECT category_parent_id
         FROM jos_virtuemart_category_categories
         WHERE category_child_id = ?
         LIMIT 1`,
        [currentId]
      );

      const isRoot = !parentRow || !parentRow[0] || !parentRow[0].category_parent_id;

      fullPath.push({
        id: currentId,
        name: currentCat.name || '',
        slug: currentCat.slug || '',
        isRoot,
      });

      if (isRoot) {
        break; // Don't include root categories — frontend will show "Каталог"
      }

      // Fetch parent category details
      const parentCat: any = await this.dataSource.query(
        `SELECT c.virtuemart_category_id AS id, cr.category_name AS name, cr.slug AS slug
         FROM jos_virtuemart_categories c
         INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
         WHERE c.virtuemart_category_id = ?`,
        [Number(parentRow[0].category_parent_id)]
      );

      if (!parentCat || !parentCat[0]) {
        break;
      }

      currentCat = parentCat[0];
      currentId = Number(parentCat[0].id);
    }

    // Reverse to get root-to-leaf order, then filter out root categories
    const path = fullPath.reverse().filter(cat => !cat.isRoot);

    return path;
  }

  /**
   * Get all categories for catalog page with product count and image fallback.
   * Supports pagination. Compatible with MySQL 5.7.
   */
  async findCatalog(page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit;

    // Query 1: Get categories with their images (deduplicated)
    const categoriesSql = `
      SELECT 
        c.virtuemart_category_id AS id,
        cr.category_name AS name,
        cr.slug AS slug,
        cr.category_description AS description,
        c.ordering AS sortOrder,
        cc.category_parent_id AS parentId,
        MAX(mm.file_url) AS categoryImage
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
      LEFT JOIN jos_virtuemart_category_categories cc ON c.virtuemart_category_id = cc.category_child_id
      LEFT JOIN jos_virtuemart_category_medias cm ON c.virtuemart_category_id = cm.virtuemart_category_id
      LEFT JOIN jos_virtuemart_medias mm ON cm.virtuemart_media_id = mm.virtuemart_media_id 
        AND mm.published = 1
        AND mm.file_url IS NOT NULL
        AND mm.file_url != ''
      WHERE c.shared = 0
      GROUP BY c.virtuemart_category_id, cr.category_name, cr.slug, cr.category_description,
               c.ordering, cc.category_parent_id
      ORDER BY c.ordering ASC
      LIMIT ? OFFSET ?
    `;

    const categories = await this.dataSource.query(categoriesSql, [limit, offset]);

    // Count total categories
    const countSql = `
      SELECT COUNT(*) AS total
      FROM jos_virtuemart_categories
      WHERE shared = 0
    `;
    const countResult = await this.dataSource.query(countSql);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Query 2: Get product counts per category
    const countsSql = `
      SELECT virtuemart_category_id, COUNT(DISTINCT virtuemart_product_id) AS cnt
      FROM jos_virtuemart_product_categories
      GROUP BY virtuemart_category_id
    `;
    const counts = await this.dataSource.query(countsSql);

    // Query 3: Get first product image per category (for fallback)
    const imagesSql = `
      SELECT pc.virtuemart_category_id, pm.file_url
      FROM jos_virtuemart_product_categories pc
      INNER JOIN jos_virtuemart_product_medias pmed
        ON pc.virtuemart_product_id = pmed.virtuemart_product_id
        AND pmed.ordering = (
          SELECT MIN(pmed2.ordering)
          FROM jos_virtuemart_product_medias pmed2
          WHERE pmed2.virtuemart_product_id = pc.virtuemart_product_id
        )
      INNER JOIN jos_virtuemart_medias pm
        ON pmed.virtuemart_media_id = pm.virtuemart_media_id
      WHERE pm.published = 1
      GROUP BY pc.virtuemart_category_id, pm.file_url
    `;
    const productImages = await this.dataSource.query(imagesSql);

    // Build maps for quick lookup
    const productCountMap = new Map<string, number>();
    counts.forEach((row: any) => {
      productCountMap.set(String(row.virtuemart_category_id), Number(row.cnt));
    });

    const productImageMap = new Map<string, string>();
    productImages.forEach((row: any) => {
      if (row.file_url && !productImageMap.has(String(row.virtuemart_category_id))) {
        productImageMap.set(String(row.virtuemart_category_id), row.file_url);
      }
    });

    const imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || 'http://localhost:3001/uploads/images';

    // Process results: merge category image with product image fallback
    const result = categories.map((row: any) => {
      let image = row.categoryImage || null;
      
      // Normalize image URL
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      // Fallback: use first product image if category has no image
      let finalImage = image;
      if (!finalImage) {
        const firstProductImage = productImageMap.get(String(row.id));
        if (firstProductImage) {
          finalImage = firstProductImage;
          if (imageBaseUrl && !finalImage.startsWith('http') && !finalImage.startsWith('/uploads/')) {
            finalImage = imageBaseUrl + '/' + finalImage.replace(/^\//, '');
          }
        }
      }

      return {
        id: Number(row.id),
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        image: finalImage || null,
        parentId: row.parentId ? Number(row.parentId) : null,
        sortOrder: Number(row.sortOrder) || 0,
        productCount: productCountMap.get(String(row.id)) || 0,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: result,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }
}
