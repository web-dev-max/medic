import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MailService } from './mail.service';
import { SpamProtectionService } from './spam-protection.service';
import { EmailTemplatesService } from './email-templates.service';
import { FileUploadMiddleware } from './file-upload.middleware';

@Module({
  providers: [MailService, SpamProtectionService, EmailTemplatesService],
  exports: [MailService, SpamProtectionService, EmailTemplatesService],
})
export class MailModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FileUploadMiddleware).forRoutes('requests/service');
  }
}
