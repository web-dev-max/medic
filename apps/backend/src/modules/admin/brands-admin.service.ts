import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AdminCreateBrandDto, AdminUpdateBrandDto, BrandQueryDto } from './dto/brand.dto';

@Injectable()
export class BrandsAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: BrandQueryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const offset = (page - 1) * pageSize;

    let whereConditions = '';
    const params: any[] = [];

    if (query.search) {
      whereConditions += ' AND mr.mf_name LIKE ?';
      params.push(`%${query.search}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jos_virtuemart_manufacturers m
      INNER JOIN jos_virtuemart_manufacturers_ru_ru mr ON m.virtuemart_manufacturer_id = mr.virtuemart_manufacturer_id
      WHERE 1=1 ${whereConditions}
    `;
    const [countRows] = await this.dataSource.query(countQuery, params);
    const total = parseInt(countRows.total);

    // Get brands
    const brandsQuery = `
      SELECT 
        m.virtuemart_manufacturer_id as id,
        mr.mf_name as name,
        mr.slug,
        mr.mf_desc as description,
        mr.metadesc as seoDescription,
        mr.customtitle as seoTitle,
        m.published,
        m.created_by as createdBy
      FROM jos_virtuemart_manufacturers m
      INNER JOIN jos_virtuemart_manufacturers_ru_ru mr ON m.virtuemart_manufacturer_id = mr.virtuemart_manufacturer_id
      WHERE 1=1 ${whereConditions}
      ORDER BY mr.mf_name ASC
      LIMIT ? OFFSET ?
    `;

    const brands = await this.dataSource.query(brandsQuery, [...params, pageSize, offset]);

    return {
      items: brands,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: number) {
    const sql = `
      SELECT 
        m.virtuemart_manufacturer_id as id,
        mr.mf_name as name,
        mr.slug,
        mr.mf_desc as description,
        mr.metadesc as seoDescription,
        mr.metakey as seoKeywords,
        mr.customtitle as seoTitle,
        m.published,
        m.created_by as createdBy,
        m.modified_by as modifiedBy
      FROM jos_virtuemart_manufacturers m
      INNER JOIN jos_virtuemart_manufacturers_ru_ru mr ON m.virtuemart_manufacturer_id = mr.virtuemart_manufacturer_id
      WHERE m.virtuemart_manufacturer_id = ?
    `;

    const rows = await this.dataSource.query(sql, [id]);
    return rows[0] || null;
  }

  async create(data: AdminCreateBrandDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Insert into jos_virtuemart_manufacturers
        const brandResult = await manager.query(
          `INSERT INTO jos_virtuemart_manufacturers (
            published, created_by, modified_by
          ) VALUES (?, 1, 1)`,
          [data.published !== false ? 1 : 0]
        );

        const brandId = brandResult.insertId;

        // Insert into jos_virtuemart_manufacturers_ru_ru
        await manager.query(
          `INSERT INTO jos_virtuemart_manufacturers_ru_ru (
            virtuemart_manufacturer_id, mf_name, slug, mf_desc,
            metadesc, customtitle
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            brandId,
            data.name,
            data.slug || '',
            data.description || '',
            data.seoDescription || '',
            data.seoTitle || '',
          ]
        );

        return this.findById(brandId);
      } catch (error: any) {
        throw new BadRequestException(`Failed to create brand: ${error.message}`);
      }
    });
  }

  async update(id: number, data: AdminUpdateBrandDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Check if brand exists
        const existing = await this.findById(id);
        if (!existing) {
          throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        // Update jos_virtuemart_manufacturers_ru_ru
        await manager.query(
          `UPDATE jos_virtuemart_manufacturers_ru_ru SET
            mf_name = COALESCE(?, mf_name),
            slug = COALESCE(?, slug),
            mf_desc = COALESCE(?, mf_desc),
            metadesc = COALESCE(?, metadesc),
            customtitle = COALESCE(?, customtitle)
          WHERE virtuemart_manufacturer_id = ?`,
          [
            data.name || existing.name,
            data.slug || existing.slug,
            data.description || null,
            data.seoDescription || null,
            data.seoTitle || null,
            id,
          ]
        );

        // Update jos_virtuemart_manufacturers
        const brandUpdateFields: string[] = [];
        const brandUpdateParams: any[] = [];

        if (data.published !== undefined) {
          brandUpdateFields.push('published = ?');
          brandUpdateParams.push(data.published ? 1 : 0);
        }

        if (brandUpdateFields.length > 0) {
          brandUpdateParams.push(id);
          await manager.query(
            `UPDATE jos_virtuemart_manufacturers SET ${brandUpdateFields.join(', ')} WHERE virtuemart_manufacturer_id = ?`,
            brandUpdateParams
          );
        }

        return this.findById(id);
      } catch (error: any) {
        throw new BadRequestException(`Failed to update brand: ${error.message}`);
      }
    });
  }

  async delete(id: number) {
    const brand = await this.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        // Soft delete - set published = 0
        await manager.query(
          'UPDATE jos_virtuemart_manufacturers SET published = 0 WHERE virtuemart_manufacturer_id = ?',
          [id]
        );

        return { success: true, message: 'Brand deleted successfully' };
      } catch (error: any) {
        throw new BadRequestException(`Failed to delete brand: ${error.message}`);
      }
    });
  }
}
