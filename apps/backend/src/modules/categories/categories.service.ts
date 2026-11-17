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
        'c.ordering AS sortOrder',
        `(
          SELECT med.file_url
          FROM jos_virtuemart_category_medias cm
          INNER JOIN jos_virtuemart_medias med
            ON med.virtuemart_media_id = cm.virtuemart_media_id
          WHERE cm.virtuemart_category_id = c.virtuemart_category_id
            AND med.published = 1
            AND med.file_url IS NOT NULL
            AND med.file_url <> ''
          ORDER BY cm.ordering ASC
          LIMIT 1
        ) AS image`,
      ])
      .from('jos_virtuemart_categories', 'c')
      .innerJoin(
        'jos_virtuemart_categories_ru_ru',
        'cr',
        'c.virtuemart_category_id = cr.virtuemart_category_id',
      )
      // top-level: у категории нет родителя с parent_id > 0
      .where(
        `NOT EXISTS (
          SELECT 1 FROM jos_virtuemart_category_categories cc2
          WHERE cc2.category_child_id = c.virtuemart_category_id
            AND cc2.category_parent_id > 0
        )`,
      )
      .andWhere('c.published = 1')
      // только категории, у которых есть хотя бы одна опубликованная картинка
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jos_virtuemart_category_medias cm
          INNER JOIN jos_virtuemart_medias med
            ON med.virtuemart_media_id = cm.virtuemart_media_id
          WHERE cm.virtuemart_category_id = c.virtuemart_category_id
            AND med.published = 1
            AND med.file_url IS NOT NULL
            AND med.file_url <> ''
        )`,
      )
      .orderBy('c.ordering', 'ASC')
      .limit(8)
      .getRawMany();

    const imageBaseUrl =
      this.configService.get<string>('IMAGE_BASE_URL') || '/uploads/images';

    return categories.map((c) => {
      let image: string | null = c.image || null;
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      return {
        id: Number(c.id),
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || '',
        image,
        parentId: null,          // top-level всегда без родителя
        sortOrder: Number(c.sortOrder) || 0,
      };
    });
  }

  async findAll() {
    const categories = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.virtuemart_category_id AS id',
        'c.category_code AS categoryCode',
        'cr.category_name AS name',
        'cr.slug AS slug',
        'cr.category_description AS description',
        'cr.metadesc AS seoDescription',
        'cr.customtitle AS seoTitle',
        'c.published AS published',
        'c.ordering AS sortOrder',
        // берём одну картинку на категорию через коррелированный подзапрос
        `(
          SELECT med.file_url
          FROM jos_virtuemart_category_medias cm
          INNER JOIN jos_virtuemart_medias med
            ON med.virtuemart_media_id = cm.virtuemart_media_id
          WHERE cm.virtuemart_category_id = c.virtuemart_category_id
            AND med.published = 1
          ORDER BY cm.ordering ASC
          LIMIT 1
        ) AS image`,
      ])
      .from('jos_virtuemart_categories', 'c')
      .innerJoin(
        'jos_virtuemart_categories_ru_ru',
        'cr',
        'c.virtuemart_category_id = cr.virtuemart_category_id',
      )
      // 👇 top-level: у категории нет родителя с parent_id > 0
      .where(
        `NOT EXISTS (
          SELECT 1 FROM jos_virtuemart_category_categories cc2
          WHERE cc2.category_child_id = c.virtuemart_category_id
            AND cc2.category_parent_id > 0
        )`,
      )
      .andWhere('c.published = 1')
      .orderBy('c.ordering', 'ASC')
      .getRawMany();

    const imageBaseUrl =
      this.configService.get<string>('IMAGE_BASE_URL') || '/uploads/images';

    return categories.map((c) => {
      let image: string | null = c.image || null;
      if (image && imageBaseUrl && !image.startsWith('http') && !image.startsWith('/uploads/')) {
        image = imageBaseUrl + '/' + image.replace(/^\//, '');
      }

      return {
        id: Number(c.id),
        categoryCode: c.categoryCode || '',
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || '',
        seoDescription: c.seoDescription || '',
        seoTitle: c.seoTitle || '',
        image,
        parentId: null,          // top-level всегда без родителя
        published: Number(c.published) === 1,
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

  async getCategoryPath(
    slug: string,
  ): Promise<Array<{ id: number; name: string; slug: string; isRoot: boolean }>> {
    const category: any = await this.dataSource.query(
      `SELECT c.virtuemart_category_id AS id, cr.category_name AS name, cr.slug AS slug
       FROM jos_virtuemart_categories c
       INNER JOIN jos_virtuemart_categories_ru_ru cr
         ON c.virtuemart_category_id = cr.virtuemart_category_id
       WHERE cr.slug = ?`,
      [slug],
    );

    if (!category || !category[0]) {
      return [];
    }

    const fullPath: Array<{
      id: number;
      name: string;
      slug: string;
      isRoot: boolean;
    }> = [];
    let currentId = Number(category[0].id);
    let currentCat = category[0];
    const visited = new Set<number>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);

      const parentRow: any = await this.dataSource.query(
        `SELECT category_parent_id
         FROM jos_virtuemart_category_categories
         WHERE category_child_id = ?
         LIMIT 1`,
        [currentId],
      );

      const isRoot =
        !parentRow || !parentRow[0] || !parentRow[0].category_parent_id;

      fullPath.push({
        id: currentId,
        name: currentCat.name || '',
        slug: currentCat.slug || '',
        isRoot,
      });

      if (isRoot) break;

      const parentCat: any = await this.dataSource.query(
        `SELECT c.virtuemart_category_id AS id,
                cr.category_name AS name,
                cr.slug AS slug
         FROM jos_virtuemart_categories c
         INNER JOIN jos_virtuemart_categories_ru_ru cr
           ON c.virtuemart_category_id = cr.virtuemart_category_id
         WHERE c.virtuemart_category_id = ?`,
        [Number(parentRow[0].category_parent_id)],
      );

      if (!parentCat || !parentCat[0]) break;

      currentCat = parentCat[0];
      currentId = Number(parentCat[0].id);
    }

    return fullPath.reverse();
  }

  /**
   * Get all categories for catalog page with product count and image fallback.
   * Supports pagination. Compatible with MySQL 5.7.
   */
  async findCatalog(page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit;

    // Тот же фильтр, что и в findAll — чтобы каталог и список категорий
    // возвращали один и тот же набор top-level
    const baseWhere = `
      c.published = 1
      AND NOT EXISTS (
        SELECT 1 FROM jos_virtuemart_category_categories cc2
        WHERE cc2.category_child_id = c.virtuemart_category_id
          AND cc2.category_parent_id > 0
      )
    `;

    // 1) Сами категории — без join'ов на медиа (без дублей, без MAX)
    const categoriesSql = `
      SELECT
        c.virtuemart_category_id AS id,
        cr.category_name AS name,
        cr.slug AS slug,
        cr.category_description AS description,
        c.ordering AS sortOrder,
        (
          SELECT med.file_url
          FROM jos_virtuemart_category_medias cm
          INNER JOIN jos_virtuemart_medias med
            ON med.virtuemart_media_id = cm.virtuemart_media_id
          WHERE cm.virtuemart_category_id = c.virtuemart_category_id
            AND med.published = 1
            AND med.file_url IS NOT NULL
            AND med.file_url <> ''
          ORDER BY cm.ordering ASC
          LIMIT 1
        ) AS categoryImage
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr
        ON c.virtuemart_category_id = cr.virtuemart_category_id
      WHERE ${baseWhere}
      ORDER BY c.ordering ASC
      LIMIT ? OFFSET ?
    `;
    const categories = await this.dataSource.query(categoriesSql, [limit, offset]);

    // 2) Count — по тем же условиям
    const countSql = `
      SELECT COUNT(*) AS total
      FROM jos_virtuemart_categories c
      WHERE ${baseWhere}
    `;
    const countResult = await this.dataSource.query(countSql);
    const total = parseInt(countResult[0]?.total || '0', 10);

    const rootIds = categories.map((c: any) => Number(c.id));
    const productCountMap = new Map<string, number>();
    const productImageMap = new Map<string, string>();

    if (rootIds.length > 0) {
      const ph = rootIds.map(() => '?').join(',');

      // 3) Счётчики товаров по поддереву (уровни 1–3, без RECURSIVE)
      const countsSql = `
        SELECT root_id AS virtuemart_category_id,
               COUNT(DISTINCT product_id) AS cnt
        FROM (
          -- уровень 1: товары прямо в top-level
          SELECT c.virtuemart_category_id AS root_id,
                 pc.virtuemart_product_id AS product_id
          FROM jos_virtuemart_categories c
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = c.virtuemart_category_id
          WHERE c.virtuemart_category_id IN (${ph})

          UNION ALL

          -- уровень 2: товары в прямых подкатегориях
          SELECT cc.category_parent_id,
                 pc.virtuemart_product_id
          FROM jos_virtuemart_category_categories cc
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = cc.category_child_id
          WHERE cc.category_parent_id IN (${ph})

          UNION ALL

          -- уровень 3: товары в под-подкатегориях
          SELECT cc1.category_parent_id,
                 pc.virtuemart_product_id
          FROM jos_virtuemart_category_categories cc1
          INNER JOIN jos_virtuemart_category_categories cc2
            ON cc2.category_parent_id = cc1.category_child_id
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = cc2.category_child_id
          WHERE cc1.category_parent_id IN (${ph})
        ) t
        GROUP BY root_id
      `;
      const counts = await this.dataSource.query(countsSql, [
        ...rootIds, ...rootIds, ...rootIds,
      ]);
      counts.forEach((row: any) => {
        productCountMap.set(String(row.virtuemart_category_id), Number(row.cnt));
      });

      // 4) Первая картинка товара для fallback (берём первую строку на root_id в JS)
      const imagesSql = `
        SELECT t.root_id AS virtuemart_category_id,
               pm.file_url,
               pmed.ordering,
               pmed.virtuemart_media_id
        FROM (
          SELECT c.virtuemart_category_id AS root_id,
                 pc.virtuemart_product_id AS product_id
          FROM jos_virtuemart_categories c
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = c.virtuemart_category_id
          WHERE c.virtuemart_category_id IN (${ph})

          UNION ALL

          SELECT cc.category_parent_id,
                 pc.virtuemart_product_id
          FROM jos_virtuemart_category_categories cc
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = cc.category_child_id
          WHERE cc.category_parent_id IN (${ph})

          UNION ALL

          SELECT cc1.category_parent_id,
                 pc.virtuemart_product_id
          FROM jos_virtuemart_category_categories cc1
          INNER JOIN jos_virtuemart_category_categories cc2
            ON cc2.category_parent_id = cc1.category_child_id
          INNER JOIN jos_virtuemart_product_categories pc
            ON pc.virtuemart_category_id = cc2.category_child_id
          WHERE cc1.category_parent_id IN (${ph})
        ) t
        INNER JOIN jos_virtuemart_product_medias pmed
          ON pmed.virtuemart_product_id = t.product_id
        INNER JOIN jos_virtuemart_medias pm
          ON pm.virtuemart_media_id = pmed.virtuemart_media_id
        WHERE pm.published = 1
          AND pm.file_url IS NOT NULL
          AND pm.file_url <> ''
        ORDER BY t.root_id ASC, pmed.ordering ASC, pmed.virtuemart_media_id ASC
      `;
      const imagesResult = await this.dataSource.query(imagesSql, [
        ...rootIds, ...rootIds, ...rootIds,
      ]);
      imagesResult.forEach((row: any) => {
        const key = String(row.virtuemart_category_id);
        if (!productImageMap.has(key) && row.file_url) {
          productImageMap.set(key, row.file_url);
        }
      });
    }

    const imageBaseUrl =
      this.configService.get<string>('IMAGE_BASE_URL') ||
      'http://localhost:3001/uploads/images';

    const normalizeUrl = (url: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('http') || url.startsWith('/uploads/')) return url;
      return imageBaseUrl + '/' + url.replace(/^\//, '');
    };

    const items = categories.map((row: any) => {
      const categoryImage = normalizeUrl(row.categoryImage || null);
      const fallbackImage = normalizeUrl(productImageMap.get(String(row.id)) || null);

      return {
        id: Number(row.id),
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        image: categoryImage || fallbackImage || null,
        parentId: null, // top-level всегда null
        sortOrder: Number(row.sortOrder) || 0,
        productCount: productCountMap.get(String(row.id)) || 0,
      };
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }
}
