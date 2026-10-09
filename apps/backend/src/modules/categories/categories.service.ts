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
}
