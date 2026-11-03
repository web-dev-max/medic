import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('content_pages')
export class ContentPage {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'slug' })
  slug: string;

  @Column({ type: 'varchar', length: 255, name: 'title' })
  title: string;

  @Column({ type: 'longtext', name: 'content' })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'seo_title' })
  seoTitle: string;

  @Column({ type: 'text', nullable: true, name: 'seo_description' })
  seoDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'seo_canonical' })
  seoCanonical: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'og_image' })
  ogImage: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
