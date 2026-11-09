import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AdminCreateCategoryDto, AdminUpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';

@Injectable()
export class CategoriesAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private readonly IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || '/uploads/images';

  private convertToAbsoluteUrl(relativePath: string): string {
    if (!relativePath) return '';

    if (relativePath.startsWith('http')) {
      return relativePath;
    }

    if (relativePath.startsWith('/uploads/')) {
      return relativePath;
    }

    const cleanPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    return `${this.IMAGE_BASE_URL}${cleanPath}`;
  }

  async findAll(query: CategoryQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const offset = (page - 1) * pageSize;

    let whereConditions = '';
    const params: any[] = [];

    if (query.search) {
      whereConditions += ' AND cr.category_name LIKE ?';
      params.push(`%${query.search}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT c.virtuemart_category_id) as total
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
      WHERE 1=1 ${whereConditions}
    `;
    const [countRows] = await this.dataSource.query(countQuery, params);
    const total = parseInt(countRows.total);

    // Get categories with parent info
    const categoriesQuery = `
      SELECT
        c.virtuemart_category_id as id,
        c.category_code,
        cr.category_name as name,
        cr.slug,
        cr.category_description as description,
        cr.metadesc as seoDescription,
        cr.customtitle as seoTitle,
        COALESCE(cc.category_parent_id, 0) as parentId,
        c.published
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
      LEFT JOIN jos_virtuemart_category_categories cc ON c.virtuemart_category_id = cc.category_child_id
      WHERE 1=1 ${whereConditions}
      GROUP BY c.virtuemart_category_id, c.category_code, cr.category_name, cr.slug, cr.category_description,
               cr.metadesc, cr.customtitle, cc.category_parent_id, c.published
      ORDER BY c.ordering ASC
      LIMIT ? OFFSET ?
    `;

    const categories = await this.dataSource.query(categoriesQuery, [...params, pageSize, offset]);

    // Fetch images for all categories
    const categoryIds = categories.map((c: any) => c.id).filter(Boolean);
    const imagesMap = new Map<number, string>();

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => '?').join(',');
      const imagesSql = `
        SELECT cm.virtuemart_category_id, med.file_url
        FROM jos_virtuemart_category_medias cm
        INNER JOIN jos_virtuemart_medias med ON cm.virtuemart_media_id = med.virtuemart_media_id
        WHERE cm.virtuemart_category_id IN (${placeholders})
          AND med.published = 1
        GROUP BY cm.virtuemart_category_id, cm.ordering, med.file_url
        ORDER BY cm.virtuemart_category_id ASC, MIN(cm.ordering) ASC
      `;
      const imagesResult = await this.dataSource.query(imagesSql, categoryIds);

      imagesResult.forEach((img: any) => {
        const cid = img.virtuemart_category_id;
        if (!imagesMap.has(cid)) {
          imagesMap.set(cid, this.convertToAbsoluteUrl(img.file_url));
        }
      });
    }

    // Convert categories to include images
    const items = categories.map((category: any) => ({
      id: category.id,
      categoryCode: category.category_code,
      name: category.name,
      slug: category.slug,
      description: category.description,
      seoDescription: category.seoDescription,
      seoTitle: category.seoTitle,
      parentId: category.parentId,
      published: category.published,
      image: imagesMap.get(category.id) || '',
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: number) {
    const sql = `
      SELECT
        c.virtuemart_category_id as id,
        c.category_code,
        cr.category_name as name,
        cr.slug,
        cr.category_description as description,
        cr.metadesc as seoDescription,
        cr.metakey as seoKeywords,
        cr.customtitle as seoTitle,
        COALESCE(cc.category_parent_id, 0) as parentId,
        c.published
      FROM jos_virtuemart_categories c
      INNER JOIN jos_virtuemart_categories_ru_ru cr ON c.virtuemart_category_id = cr.virtuemart_category_id
      LEFT JOIN jos_virtuemart_category_categories cc ON c.virtuemart_category_id = cc.category_child_id
      WHERE c.virtuemart_category_id = ?
    `;

    const rows = await this.dataSource.query(sql, [id]);
    const category = rows[0] || null;

    if (!category) return null;

    // Fetch image
    const imagesSql = `
      SELECT med.file_url
      FROM jos_virtuemart_category_medias cm
      INNER JOIN jos_virtuemart_medias med ON cm.virtuemart_media_id = med.virtuemart_media_id
      WHERE cm.virtuemart_category_id = ? AND med.published = 1
      ORDER BY cm.ordering LIMIT 1
    `;
    const imagesRaw = await this.dataSource.query(imagesSql, [id]);
    const image = imagesRaw[0] ? this.convertToAbsoluteUrl(imagesRaw[0].file_url) : '';

    return {
      ...category,
      image,
    };
  }

  async findTree() {
    const categories = await this.findAll({ page: 1, pageSize: 1000 });

    const buildTree = (parentId: number = 0): any[] => {
      return (categories.items as any[])
        .filter((c: any) => c.parentId === parentId)
        .map((category: any) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  }

  async create(data: AdminCreateCategoryDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Check if categoryCode already exists
        const existingCode = await manager.query(
          `SELECT virtuemart_category_id FROM jos_virtuemart_categories WHERE category_code = ?`,
          [data.categoryCode]
        );

        if (existingCode && existingCode.length > 0) {
          throw new BadRequestException(`Категория с номером "${data.categoryCode}" уже существует`);
        }

        // Insert into jos_virtuemart_categories
        const categoryResult = await manager.query(
          `INSERT INTO jos_virtuemart_categories (
            virtuemart_vendor_id, category_code, published, shared,
            created_on, created_by, modified_on, modified_by, locked_on, locked_by
          ) VALUES (1, ?, ?, 0,
            NOW(), 0, NOW(), 0,
            '1970-01-01 00:00:00', 0
          )`,
          [
            data.categoryCode,
            data.published !== false ? 1 : 0,
          ]
        );

        const categoryId = categoryResult.insertId;

        // Auto-generate slug from name if not provided
        let slug = data.slug;
        if (!slug || slug.trim() === '') {
          // Convert Russian name to URL-friendly slug
          slug = data.name
            .toLowerCase()
            .replace(/[а-яё]/g, (char) => {
              const cyrillicMap: Record<string, string> = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
                'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
                'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
              };
              return cyrillicMap[char] || char;
            })
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 192);
        }

        // Insert into jos_virtuemart_categories_ru_ru
        await manager.query(
          `INSERT INTO jos_virtuemart_categories_ru_ru (
            virtuemart_category_id, category_name, slug, category_description,
            metadesc, metakey, customtitle
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            categoryId,
            data.name,
            slug,
            data.description || '',
            data.seoDescription || '',
            '',
            data.seoTitle || '',
          ]
        );

        // Insert parent relation if specified
        if (data.parentId && data.parentId !== 0) {
          await manager.query(
            `INSERT INTO jos_virtuemart_category_categories (category_parent_id, category_child_id, ordering) VALUES (?, ?, 0)`,
            [data.parentId, categoryId]
          );
        }

        return this.findById(categoryId);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException(`Категория с номером "${data.categoryCode}" уже существует`);
        }
        throw new BadRequestException(`Failed to create category: ${error.message}`);
      }
    });
  }

  async update(id: number, data: AdminUpdateCategoryDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Check if category exists
        const existing = await this.findById(id);
        if (!existing) {
          throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Check if categoryCode already exists (excluding current category)
        if (data.categoryCode !== undefined && data.categoryCode !== existing.category_code) {
          const existingCode = await manager.query(
            `SELECT virtuemart_category_id FROM jos_virtuemart_categories WHERE category_code = ? AND virtuemart_category_id != ?`,
            [data.categoryCode, id]
          );

          if (existingCode && existingCode.length > 0) {
            throw new BadRequestException(`Категория с номером "${data.categoryCode}" уже существует`);
          }
        }

        // Update jos_virtuemart_categories_ru_ru
        await manager.query(
          `UPDATE jos_virtuemart_categories_ru_ru SET
            category_name = COALESCE(?, category_name),
            slug = COALESCE(?, slug),
            category_description = COALESCE(?, category_description),
            metadesc = COALESCE(?, metadesc),
            customtitle = COALESCE(?, customtitle)
          WHERE virtuemart_category_id = ?`,
          [
            data.name || existing.name,
            data.slug || existing.slug,
            data.description !== undefined ? data.description : null,
            data.seoDescription || null,
            data.seoTitle || null,
            id,
          ]
        );

        // Update jos_virtuemart_categories
        const categoryUpdateFields: string[] = [];
        const categoryUpdateParams: any[] = [];

        if (data.categoryCode !== undefined) {
          categoryUpdateFields.push('category_code = ?');
          categoryUpdateParams.push(data.categoryCode);
        }
        if (data.published !== undefined) {
          categoryUpdateFields.push('published = ?');
          categoryUpdateParams.push(data.published ? 1 : 0);
        }

        if (categoryUpdateFields.length > 0) {
          categoryUpdateFields.push('modified_on = NOW()');
          categoryUpdateParams.push(id);
          await manager.query(
            `UPDATE jos_virtuemart_categories SET ${categoryUpdateFields.join(', ')} WHERE virtuemart_category_id = ?`,
            categoryUpdateParams
          );
        } else {
          // Even if no other fields changed, update modified_on
          await manager.query(
            `UPDATE jos_virtuemart_categories SET modified_on = NOW() WHERE virtuemart_category_id = ?`,
            [id]
          );
        }

        // Update parent relation
        if (data.parentId !== undefined) {
          // Delete old parent relation
          await manager.query(
            `DELETE FROM jos_virtuemart_category_categories WHERE category_child_id = ?`,
            [id]
          );
          // Insert new parent relation
          if (data.parentId && data.parentId !== 0) {
            await manager.query(
              `INSERT INTO jos_virtuemart_category_categories (category_parent_id, category_child_id, ordering) VALUES (?, ?, 0)`,
              [data.parentId, id]
            );
          }
        }

        return this.findById(id);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new BadRequestException(`Категория с номером "${data.categoryCode}" уже существует`);
        }
        throw new BadRequestException(`Failed to update category: ${error.message}`);
      }
    });
  }

  async delete(id: number) {
    const category = await this.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        // Soft delete - set published = 0
        await manager.query(
          'UPDATE jos_virtuemart_categories SET published = 0 WHERE virtuemart_category_id = ?',
          [id]
        );

        return { success: true, message: 'Category deleted successfully' };
      } catch (error: any) {
        throw new BadRequestException(`Failed to delete category: ${error.message}`);
      }
    });
  }
}
