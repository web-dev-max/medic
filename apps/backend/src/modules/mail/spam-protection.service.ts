import { Injectable, BadRequestException, Logger } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class SpamProtectionService {
  private readonly logger = new Logger(SpamProtectionService.name);
  private readonly rateLimits = new Map<string, RateLimitEntry>();

  // Configuration
  private readonly RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_MAX_REQUESTS = 3; // max 3 requests per window
  private readonly HONEYPOT_FIELD_NAME = 'website'; // hidden field name

  /**
   * Check honeypot field - bots often fill hidden fields
   */
  checkHoneypot(data: Record<string, unknown>): void {
    if (data[this.HONEYPOT_FIELD_NAME] !== undefined && data[this.HONEYPOT_FIELD_NAME] !== '') {
      this.logger.warn('Honeypot triggered - potential bot submission');
      // Silently accept to not reveal protection mechanism
      throw new BadRequestException('Не удалось обработать заявку');
    }
  }

  /**
   * Check rate limit by IP
   */
  checkRateLimit(ip: string): void {
    const now = Date.now();
    const entry = this.rateLimits.get(ip);

    if (entry) {
//       if (now < entry.resetAt && entry.count >= this.RATE_LIMIT_MAX_REQUESTS) {
//         this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
//         throw new BadRequestException('Слишком много попыток отправки. Попробуйте позже.');
//       }

      if (now >= entry.resetAt) {
        // Reset window
        this.rateLimits.set(ip, {
          count: 1,
          resetAt: now + this.RATE_LIMIT_WINDOW_MS,
        });
        return;
      }

      entry.count++;
    } else {
      this.rateLimits.set(ip, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS,
      });
    }

    // Cleanup old entries periodically
    this.cleanupOldEntries(now);
  }

  /**
   * Validate request size limits
   */
  validateRequestSize(body: Record<string, unknown>): void {
    const maxFieldLength = 5000;
    const maxArrayLength = 100;

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.length > maxFieldLength) {
        this.logger.warn(`Field "${key}" exceeds max length (${value.length}/${maxFieldLength})`);
        throw new BadRequestException('Превышена максимальная длина поля');
      }
      if (Array.isArray(value) && value.length > maxArrayLength) {
        this.logger.warn(`Field "${key}" array exceeds max length (${value.length}/${maxArrayLength})`);
        throw new BadRequestException('Превышено максимальное количество элементов');
      }
    }
  }

  /**
   * Validate suspicious/empty requests
   */
  validateRequestContent(data: Record<string, unknown>): void {
    // Check for empty required fields (name, phone should exist)
    const hasName = data.name && typeof data.name === 'string' && data.name.trim().length > 0;
    const hasPhone = data.phone && typeof data.phone === 'string' && data.phone.trim().length > 0;

    if (!hasName || !hasPhone) {
      this.logger.warn('Request missing required fields (name/phone)');
      throw new BadRequestException('Не удалось обработать заявку');
    }
  }

  private cleanupOldEntries(now: number): void {
    for (const [ip, entry] of this.rateLimits.entries()) {
      if (now > entry.resetAt) {
        this.rateLimits.delete(ip);
      }
    }
  }

  getHoneypotFieldName(): string {
    return this.HONEYPOT_FIELD_NAME;
  }
}
