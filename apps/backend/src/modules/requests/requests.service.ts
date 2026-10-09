import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MailService, EmailAttachment } from '../mail/mail.service';
import { SpamProtectionService } from '../mail/spam-protection.service';
import { EmailTemplatesService, EmailWithAttachments } from '../mail/email-templates.service';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly spamProtection: SpamProtectionService,
    private readonly emailTemplates: EmailTemplatesService,
  ) {}

  async create(type: string, data: any, ip?: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Spam protection checks
      if (ip) {
        this.spamProtection.checkRateLimit(ip);
      }

      // 2. Honeypot check
      this.spamProtection.checkHoneypot(data);

      // 3. Request size validation
      this.spamProtection.validateRequestSize(data);

      // 4. Content validation
      this.spamProtection.validateRequestContent(data);

      // 5. Send email based on type
      let emailData: { subject: string; html: string };
      let attachments: EmailAttachment[] | undefined;

      switch (type) {
        case 'callback':
          emailData = this.emailTemplates.formatCallbackEmail(data);
          break;
        case 'general':
          emailData = this.emailTemplates.formatGeneralEmail(data);
          break;
        case 'product':
          emailData = this.emailTemplates.formatProductEmail(data);
          break;
        case 'price-inquiry':
          emailData = this.emailTemplates.formatPriceInquiryEmail(data);
          break;
        case 'service':
          const serviceResult = this.emailTemplates.formatServiceEmail(
            data,
            (data as any)._attachments,
          ) as EmailWithAttachments;
          emailData = { subject: serviceResult.subject, html: serviceResult.html };
          attachments = serviceResult.attachments?.map((a) => ({
            filename: a.filename,
            path: a.path,
            contentType: a.contentType,
          }));
          break;
        case 'cart':
          emailData = this.emailTemplates.formatCartEmail(data);
          break;
        case 'leasing':
          emailData = this.emailTemplates.formatLeasingEmail(data);
          break;
        default:
          emailData = this.emailTemplates.formatGeneralEmail({
            name: data.name || 'Пользователь',
            phone: data.phone || '—',
            email: data.email || '—',
            message: JSON.stringify(data),
          });
      }

      await this.mailService.sendEmail({
        ...emailData,
        attachments,
      });

      // 6. Clean up file attachments
      if (attachments && attachments.length > 0) {
        this.mailService.cleanUpAttachments(attachments);
      }

      return { success: true, message: 'Заявка успешно отправлена' };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to process request: ${error?.message || 'unknown error'}`, error?.stack);
      // Don't reveal internal errors to client
      throw new BadRequestException('Не удалось обработать заявку. Попробуйте позже.');
    }
  }

  async findAll() {
    // Removed DB access - requests are no longer stored
    return [];
  }
}
