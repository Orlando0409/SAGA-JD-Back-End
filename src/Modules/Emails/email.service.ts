import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';
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
  private logoBase64: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY no está configurado en las variables de entorno');
    }
    SendGrid.setApiKey(apiKey!);
    
    // Cargar logo en base64 una sola vez
    try {
      const logoPath = path.join(process.cwd(), 'src/Modules/Emails/Logo/logo.jpeg');
      const logoBuffer = fs.readFileSync(logoPath);
      this.logoBase64 = logoBuffer.toString('base64');
    } catch (error) {
      console.error('Error al cargar el logo:', error);
      this.logoBase64 = '';
    }
  }

  private getLogoAttachment() {
    if (!this.logoBase64) return [];
    
    return [{
      content: this.logoBase64,
      filename: 'logo.jpeg',
      type: 'image/jpeg',
      disposition: 'inline',
      content_id: 'logo'
    }];
  }
  // Enviar email cuando el admin responde al reporte
  async enviarEmailRespuestaReporte(reporteData: {
    Nombre?: string;
    Primer_Apellido?: string;
    Segundo_Apellido?: string;
    Correo?: string;
    Ubicacion?: string;
    Descripcion?: string;
    Respuesta?: string;
  }) {
    try {
      const to = reporteData.Correo;
      if (!to) {
        throw new Error('Correo destinatario no proporcionado');
      }

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Respuesta a tu reporte',
        html: ReporteRespondidoMail(reporteData),
        attachments: this.getLogoAttachment(),
      });
      console.log('Email de respuesta de reporte enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de respuesta de reporte:', error);
      throw error;
    }
  }

  async sendRecoverPasswordMail(createEmailDTO: createEmailDTO) {
    try {
      await SendGrid.send({
        to: createEmailDTO.to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: createEmailDTO.subject,
        html: RecoverPasswordMail(createEmailDTO.RecoverPasswordURL),
        attachments: this.getLogoAttachment(),
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
      await SendGrid.send({
        to: emailDestino,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: `Solicitud de ${tipoSolicitud} - Recibida Exitosamente`,
        html: SolicitudCreadaExitosamenteMail(tipoSolicitud, nombreApellidos),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to: emailData.to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: emailData.subject,
        html: EstadoSolicitudMail(
          tipoSolicitud,
          emailData.estadoSolicitud,
          emailData.message // Usando message como nombreApellidos
        ),
        attachments: this.getLogoAttachment(),
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
      await SendGrid.send({
        to: emailDestino,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: `Actualización de ${tipoSolicitud} - Estado: ${estadoSolicitud}`,
        html: EstadoSolicitudMail(tipoSolicitud, estadoSolicitud, nombreApellidos),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Confirmación de recepción de tu reporte',
        html: ReporteMail(reporteData),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Confirmación de recepción de tu queja',
        html: QuejaMail(quejaData),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Respuesta a tu queja',
        html: QuejaRespondidaMail(quejaData),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Confirmación de recepción de tu sugerencia',
        html: SugerenciaMail(sugerenciaData),
        attachments: this.getLogoAttachment(),
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

      await SendGrid.send({
        to,
        from: this.configService.get<string>('MAIL_FROM')!,
        subject: 'Respuesta a tu sugerencia',
        html: SugerenciaRespondidaMail(sugerenciaData),
        attachments: this.getLogoAttachment(),
      });
      console.log('Email de respuesta de sugerencia enviado a', to);
    } catch (error) {
      console.error('Error al enviar email de respuesta de sugerencia:', error);
      throw error;
    }
  }
}