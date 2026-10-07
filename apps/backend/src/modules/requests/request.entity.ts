import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'enum', enum: ['callback', 'product', 'service', 'general', 'cart'] })
  type: string;

  @Column({ type: 'simple-json' })
  data: Record<string, unknown>;

  @Column({ type: 'enum', enum: ['new', 'processed', 'completed'], default: 'new' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
