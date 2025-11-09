import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './mailer.service';
import { TestController } from './mailer.controller';


@Module({
  imports: [ConfigModule],
  controllers: [TestController],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailerGmailModule {}
