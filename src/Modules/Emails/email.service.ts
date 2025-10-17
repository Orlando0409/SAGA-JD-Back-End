import { Injectable} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { createEmailDTO } from './DTO/createEmailDTO';
import { EstadoSolicitudEmailDTO } from './DTO/EstadoSolicitudEmail.dto';
import { RecoverPasswordMail } from './Template/RecoverPasswordMail';
import { SolicitudCreadaExitosamenteMail, EstadoSolicitudMail } from './Template/SolicitudMail';
import { ReporteMail } from './Template/PlantillaReporte';
import { ReporteRespondidoMail } from './Template/ReporteRespondidoMail';
import { QuejaMail } from './Template/QuejaMail';
import { QuejaRespondidaMail } from './Template/QuejaRespondidaMail';
import { SugerenciaMail } from './Template/SugerenciaMail';
import { SugerenciaRespondidaMail } from './Template/SugerenciaRespondidaMail';


@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  // Enviar email cuando el admin responde al reporte
  async enviarEmailRespuestaReporte(reporteData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    ubicacion?: string;
    descripcion?: string;
    respuesta?: string;
  }) {
    try {
      const to = reporteData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Respuesta a tu reporte',
        html: ReporteRespondidoMail(reporteData),
        attachments,
      });
      console.log('Email de respuesta de reporte enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de respuesta de reporte:', error);
      throw error;
    }
  }

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

  // Enviar email al crear un reporte
  async enviarEmailReporte(reporteData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    ubicacion?: string;
    descripcion?: string;
    adjuntos?: string[];
  }) {
    try {
      const to = reporteData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Confirmación de recepción de tu reporte',
        html: ReporteMail(reporteData),
        attachments,
      });
      console.log('Email de reporte enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de reporte:', error);
      throw error;
    }
  }

  // Enviar email al crear una queja
  async enviarEmailQueja(quejaData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    descripcion?: string;
    adjuntos?: string[];
  }) {
    try {
      const to = quejaData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Confirmación de recepción de tu queja',
        html: QuejaMail(quejaData),
        attachments,
      });
      console.log('Email de queja enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de queja:', error);
      throw error;
    }
  }

  // Enviar email cuando el admin responde a la queja
  async enviarEmailRespuestaQueja(quejaData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    descripcion?: string;
    respuesta?: string;
  }) {
    try {
      const to = quejaData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Respuesta a tu queja',
        html: QuejaRespondidaMail(quejaData),
        attachments,
      });
      console.log('Email de respuesta de queja enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de respuesta de queja:', error);
      throw error;
    }
  }

  // Enviar email al crear una sugerencia
  async enviarEmailSugerencia(sugerenciaData: {
    Correo?: string;
    Mensaje?: string;
    adjuntos?: string[];
  }) {
    try {
      const to = sugerenciaData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Confirmación de recepción de tu sugerencia',
        html: SugerenciaMail(sugerenciaData),
        attachments,
      });
      console.log('Email de sugerencia enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de sugerencia:', error);
      throw error;
    }
  }

  // Enviar email cuando el admin responde a la sugerencia
  async enviarEmailRespuestaSugerencia(sugerenciaData: {
    Correo?: string;
    Mensaje?: string;
    respuesta?: string;
  }) {
    try {
      const to = sugerenciaData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }
      const attachments: any[] = [
        {
          filename: 'logo.jpeg',
          path: process.cwd() + '/src/Modules/Emails/Logo/logo.jpeg',
          cid: 'logo',
        },
      ];

      await this.mailService.sendMail({
        to,
        subject: 'Respuesta a tu sugerencia',
        html: SugerenciaRespondidaMail(sugerenciaData),
        attachments,
      });
      console.log('Email de respuesta de sugerencia enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de respuesta de sugerencia:', error);
      throw error;
    }
  }
}