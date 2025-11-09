import { Controller, Post } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { Public } from 'src/Modules/auth/Decorator/Public.decorator';


@Public()
@Controller('test')
export class TestController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  async send() {
    return await this.emailService.sendEmail(
      'luis.baltodano.espinoza@est.una.ac.cr',
      'Correo de prueba ✅',
      'Esto fue enviado desde NestJS usando Gmail OAuth2 🚀'
    );
  }
}
