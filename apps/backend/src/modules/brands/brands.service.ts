import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BrandsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll() {
    const brands = await this.dataSource
      .createQueryBuilder()
      .select([
        'm.virtuemart_manufacturer_id AS id',
        'mr.mf_name AS name',
        'mr.slug AS slug',
        'mr.mf_desc AS description',
      ])
      .from('jos_virtuemart_manufacturers', 'm')
      .innerJoin('jos_virtuemart_manufacturers_ru_ru', 'mr', 'm.virtuemart_manufacturer_id = mr.virtuemart_manufacturer_id')
      .where('m.published = 1')
      .orderBy('mr.mf_name', 'ASC')
      .getRawMany();

    return brands.map((b) => ({
      id: Number(b.id),
      name: b.name || '',
      slug: b.slug || '',
      description: b.description || '',
    }));
  }

  async findOne(slug: string) {
    const brand = await this.dataSource
      .createQueryBuilder()
      .select([
        'm.virtuemart_manufacturer_id AS id',
        'mr.mf_name AS name',
        'mr.slug AS slug',
        'mr.mf_desc AS description',
      ])
      .from('jos_virtuemart_manufacturers', 'm')
      .innerJoin('jos_virtuemart_manufacturers_ru_ru', 'mr', 'm.virtuemart_manufacturer_id = mr.virtuemart_manufacturer_id')
      .where('m.published = 1')
      .andWhere('mr.slug = :slug', { slug })
      .getRawOne();

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${slug}`);
    }

    return {
      id: Number(brand.id),
      name: brand.name || '',
      slug: brand.slug || '',
      description: brand.description || '',
    };
  }
}
