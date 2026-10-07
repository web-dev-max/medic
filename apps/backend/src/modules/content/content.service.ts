import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentPage } from './content-page.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentPage)
    private readonly contentRepository: Repository<ContentPage>,
  ) {}

  async findBySlug(slug: string): Promise<ContentPage> {
    const page = await this.contentRepository.findOne({
      where: { slug, isActive: true },
    });

    if (!page) {
      throw new NotFoundException(`Content page not found: ${slug}`);
    }

    return page;
  }

  async findAll(): Promise<ContentPage[]> {
    return this.contentRepository.find({
      where: { isActive: true },
      order: { title: 'ASC' },
    });
  }

  async create(data: Partial<ContentPage>): Promise<ContentPage> {
    const page = this.contentRepository.create(data);
    return this.contentRepository.save(page);
  }

  async update(id: number, data: Partial<ContentPage>): Promise<ContentPage> {
    await this.contentRepository.update(id, data);
    const page = await this.contentRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Content page with id ${id} not found`);
    }
    return page;
  }

  async remove(id: number): Promise<void> {
    await this.contentRepository.update(id, { isActive: false });
  }
}
