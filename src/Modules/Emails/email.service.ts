import { Injectable} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { createEmailDTO } from './DTO/createEmailDTO';
import { RecoverPasswordMail } from './Template/RecoverPasswordMail';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendRecoverPasswordMail(createEmailDTO: createEmailDTO) {
  try {
    await this.mailService.sendMail({
      to: createEmailDTO.to,
      subject: createEmailDTO.subject,
      html: RecoverPasswordMail(createEmailDTO.RecoverPasswordURL),
      attachments: [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo'
        }
      ]
    });
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
}

  
}

