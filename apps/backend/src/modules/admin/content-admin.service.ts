import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface UpdateContentPageDto {
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
}

@Injectable()
export class ContentAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findBySlug(slug: string) {
    const sql = `
      SELECT id, slug, title, content, seo_title as seoTitle, seo_description as seoDescription,
             seo_canonical as seoCanonical, og_image as ogImage, is_active as isActive,
             created_at as createdAt, updated_at as updatedAt
      FROM content_pages
      WHERE slug = ?
    `;
    
    const rows = await this.dataSource.query(sql, [slug]);
    return rows[0] || null;
  }

  async findAll() {
    const sql = `
      SELECT id, slug, title, seo_title as seoTitle, seo_description as seoDescription,
             is_active as isActive, updated_at as updatedAt
      FROM content_pages
      ORDER BY title ASC
    `;
    
    return await this.dataSource.query(sql);
  }

  async createOrUpdate(data: UpdateContentPageDto) {
    return this.dataSource.transaction(async (manager) => {
      // Check if page exists
      const existing = await manager.query(
        `SELECT id FROM content_pages WHERE slug = ?`,
        [data.slug]
      );

      if (existing && existing.length > 0) {
        // Update existing
        await manager.query(
          `UPDATE content_pages SET 
            title = ?,
            content = ?,
            seo_title = COALESCE(?, seo_title),
            seo_description = COALESCE(?, seo_description)
          WHERE slug = ?`,
          [data.title, data.content, data.seoTitle || null, data.seoDescription || null, data.slug]
        );

        return {
          id: existing[0].id,
          ...data,
        };
      } else {
        // Create new
        const result = await manager.query(
          `INSERT INTO content_pages (slug, title, content, seo_title, seo_description, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [data.slug, data.title, data.content, data.seoTitle || null, data.seoDescription || null]
        );

        return {
          id: result.insertId,
          ...data,
        };
      }
    });
  }
}
