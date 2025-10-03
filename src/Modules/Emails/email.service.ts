import { Injectable} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { createEmailDTO } from './DTO/createEmailDTO';
import { EstadoSolicitudEmailDTO } from './DTO/EstadoSolicitudEmail.dto';
import { RecoverPasswordMail } from './Template/RecoverPasswordMail';
import { SolicitudCreadaExitosamenteMail, EstadoSolicitudMail } from './Template/SolicitudMail';


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

  // Método para enviar email cuando se crea una solicitud exitosamente
  async enviarEmailSolicitudCreada(
    emailDestino: string,
    tipoSolicitud: string,
    nombreApellidos?: string
  ) {
    try {
      await this.mailService.sendMail({
        to: emailDestino,
        subject: `Solicitud de ${tipoSolicitud} - Recibida Exitosamente`,
        html: SolicitudCreadaExitosamenteMail(tipoSolicitud, nombreApellidos),
        attachments: [
          {
            filename: 'logo.jpeg',
            path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
            cid: 'logo'
          }
        ]
      });
      console.log('Email de solicitud creada enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el email de solicitud creada:', error);
      throw error;
    }
  }

  // Método para enviar email cuando cambia el estado de una solicitud
  async enviarEmailCambioEstadoSolicitud(emailData: EstadoSolicitudEmailDTO) {
    try {
      // Extraer tipo de solicitud del subject si viene incluido
      const tipoSolicitud = emailData.subject.replace(/^(Actualización:|Estado de|Solicitud de)/i, '').trim();
      
      await this.mailService.sendMail({
        to: emailData.to,
        subject: emailData.subject,
        html: EstadoSolicitudMail(
          tipoSolicitud,
          emailData.estadoSolicitud,
          emailData.message // Usando message como nombreApellidos
        ),
        attachments: [
          {
            filename: 'logo.jpeg',
            path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
            cid: 'logo'
          }
        ]
      });
      console.log('Email de cambio de estado de solicitud enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el email de cambio de estado:', error);
      throw error;
    }
  }

  // Método más específico para cambio de estado con parámetros individuales
  async enviarEmailActualizacionEstado(
    emailDestino: string,
    tipoSolicitud: string,
    estadoSolicitud: string,
    nombreApellidos?: string
  ) {
    try {
      await this.mailService.sendMail({
        to: emailDestino,
        subject: `Actualización de ${tipoSolicitud} - Estado: ${estadoSolicitud}`,
        html: EstadoSolicitudMail(tipoSolicitud, estadoSolicitud, nombreApellidos),
        attachments: [
          {
            filename: 'logo.jpeg',
            path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
            cid: 'logo'
          }
        ]
      });
      console.log('Email de actualización de estado enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el email de actualización de estado:', error);
      throw error;
    }
  }
}