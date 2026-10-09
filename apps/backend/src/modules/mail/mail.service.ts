import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

export interface EmailAttachment {
  filename: string;
  path: string;
  contentType?: string;
}

export interface EmailData {
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async sendEmail(data: EmailData): Promise<void> {
    const to = process.env.ADMIN_EMAIL || 'admin@medikomplus.ru';
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@medikomplus.ru';

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: data.subject,
        text: data.text || data.html.replace(/<[^>]*>/g, ''),
        html: data.html,
        attachments: data.attachments,
      });
      this.logger.log(`Email sent to ${to}: ${data.subject}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error?.message || 'unknown error'}`, error?.stack);
      throw error;
    }
  }

  cleanUpAttachments(attachments: EmailAttachment[]): void {
    for (const attachment of attachments) {
      if (attachment.path && fs.existsSync(attachment.path)) {
        try {
          fs.unlinkSync(attachment.path);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  buildBaseHtml(subject: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f7fa; }
          .email-container { max-width: 640px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          .email-header { background: #007B8D; color: #ffffff; padding: 20px 24px; }
          .email-header h1 { margin: 0; font-size: 20px; font-weight: 700; }
          .email-body { padding: 24px; color: #4a5568; line-height: 1.6; }
          .email-footer { background: #f7fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>${subject}</h1>
          </div>
          <div class="email-body">
            ${content}
          </div>
          <div class="email-footer">
            МедикомПлюс — Медицинское и стоматологическое оборудование<br>
            © ${new Date().getFullYear()} Все права защищены.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
