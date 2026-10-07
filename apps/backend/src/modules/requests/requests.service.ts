import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEntity } from './request.entity';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestsRepository: Repository<RequestEntity>,
  ) {}

  async create(type: string, data: any): Promise<RequestEntity> {
    const request = this.requestsRepository.create({ type, data });
    const saved = await this.requestsRepository.save(request);

    // Send email notification
    this.sendEmailNotification(type, data);

    return saved;
  }

  async findAll() {
    return this.requestsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  private sendEmailNotification(type: string, data: any): void {
    const to = process.env.ADMIN_EMAIL || 'admin@medikomplus.ru';

    const subjectMap: Record<string, string> = {
      callback: 'Заявка: Обратный звонок',
      product: 'Заявка: Заказ товара',
      service: 'Заявка: Сервисное обслуживание',
      general: 'Заявка: Общее обращение',
      cart: 'Заявка: Корзина',
    };

    const subject = subjectMap[type] || 'Новая заявка';

    const text = this.formatEmailText(type, data);

    transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@medikomplus.ru',
      to,
      subject,
      text,
    }).catch((err) => {
      this.logger.error('Failed to send email:', err);
    });
  }

  private formatEmailText(type: string, data: any): string {
    const lines: string[] = [`Тип заявки: ${type}\n`];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        lines.push(`${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }
}
