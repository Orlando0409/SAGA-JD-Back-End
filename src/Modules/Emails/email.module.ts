import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const nodeEnv = config.get('NODE_ENV');
        
        // Solo configurar MailerModule en desarrollo
        if (nodeEnv !== 'production') {
          return {
            transport: {
              host: config.get('MAIL_HOST'),
              port: config.get('MAIL_PORT'),
              secure: false,
              auth: {
                user: config.get('MAIL_USER'),
                pass: config.get('MAIL_PASS'),
              },
            },
            defaults: {
              from: config.get('MAIL_FROM'),
            },
          };
        }
        
        // En producción, retornar configuración vacía (usaremos SendGrid)
        return {};
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}