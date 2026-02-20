import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

// DTOs
import { createEmailDTO } from './DTO/createEmailDTO';
import { EstadoSolicitudEmailDTO } from './DTO/EstadoSolicitudEmail.dto';

// Templates
import { RecoverPasswordMail } from './Template/RecoverPasswordMail';
import {
  SolicitudCreadaExitosamenteMail,
  EstadoSolicitudMail,
} from './Template/SolicitudMail';
import { ReporteMail } from './Template/PlantillaReporte';
import { ReporteRespondidoMail } from './Template/ReporteRespondidoMail';
import { QuejaMail } from './Template/QuejaMail';
import { QuejaRespondidaMail } from './Template/QuejaRespondidaMail';
import { SugerenciaMail } from './Template/SugerenciaMail';
import { SugerenciaRespondidaMail } from './Template/SugerenciaRespondidaMail';

@Injectable()
export class EmailService {
  private logoBase64: string;

  constructor(private readonly mailerService: MailerService) {
    // Cargar logo una sola vez
    try {
      const logoPath = path.join(
        process.cwd(),
        'src/Modules/Emails/Logo/logo.jpeg',
      );
      const logoBuffer = fs.readFileSync(logoPath);
      this.logoBase64 = logoBuffer.toString('base64');
    } catch (error) {
      console.error('Error al cargar el logo:', error);
      this.logoBase64 = '';
    }
  }

  private getLogoAttachment() {
    if (!this.logoBase64) return [];

    return [
      {
        filename: 'logo.jpeg',
        content: this.logoBase64,
        cid: 'logo', // para usar <img src="cid:logo" />
        encoding: 'base64',
      },
    ];
  }

  // RECUPERAR CONTRASEÑA
  async sendRecoverPasswordMail(data: createEmailDTO) {
    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        html: RecoverPasswordMail(data.RecoverPasswordURL),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando correo de recuperación:', error);
      throw error;
    }
  }

  // SOLICITUD CREADA
  async enviarEmailSolicitudCreada(
    emailDestino: string,
    tipoSolicitud: string,
    nombreApellidos?: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: emailDestino,
        subject: `Solicitud de ${tipoSolicitud} - Recibida Exitosamente`,
        html: SolicitudCreadaExitosamenteMail(
          tipoSolicitud,
          nombreApellidos,
        ),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando email de solicitud creada:', error);
      throw error;
    }
  }


  // CAMBIO DE ESTADO 
  async enviarEmailCambioEstadoSolicitud(
    emailData: EstadoSolicitudEmailDTO,
  ) {
    try {
      const tipoSolicitud = emailData.subject
        .replace(/^(Actualización:|Estado de|Solicitud de)/i, '')
        .trim();

      await this.mailerService.sendMail({
        to: emailData.to,
        subject: emailData.subject,
        html: EstadoSolicitudMail(
          tipoSolicitud,
          emailData.estadoSolicitud,
          emailData.message,
        ),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando cambio de estado:', error);
      throw error;
    }
  }


  // ACTUALIZACIÓN DE ESTADO 
  async enviarEmailActualizacionEstado(
    emailDestino: string,
    tipoSolicitud: string,
    estadoSolicitud: string,
    nombreApellidos?: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: emailDestino,
        subject: `Actualización de ${tipoSolicitud} - Estado: ${estadoSolicitud}`,
        html: EstadoSolicitudMail(
          tipoSolicitud,
          estadoSolicitud,
          nombreApellidos,
        ),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando actualización de estado:', error);
      throw error;
    }
  }


  // REPORTES
  async enviarEmailReporte(reporteData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    ubicacion?: string;
    descripcion?: string;
    adjuntos?: string[];
  }) {
    if (!reporteData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: reporteData.Correo,
        subject: 'Confirmación de recepción de tu reporte',
        html: ReporteMail(reporteData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando reporte:', error);
      throw error;
    }
  }

  async enviarEmailRespuestaReporte(reporteData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    ubicacion?: string;
    descripcion?: string;
    respuesta?: string;
  }) {
    if (!reporteData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: reporteData.Correo,
        subject: 'Respuesta a tu reporte',
        html: ReporteRespondidoMail(reporteData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando respuesta de reporte:', error);
      throw error;
    }
  }

  
  // QUEJAS
  async enviarEmailQueja(quejaData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    descripcion?: string;
    adjuntos?: string[];
  }) {
    if (!quejaData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: quejaData.Correo,
        subject: 'Confirmación de recepción de tu queja',
        html: QuejaMail(quejaData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando queja:', error);
      throw error;
    }
  }

  async enviarEmailRespuestaQueja(quejaData: {
    name?: string;
    Papellido?: string;
    Sapellido?: string;
    Correo?: string;
    descripcion?: string;
    respuesta?: string;
  }) {
    if (!quejaData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: quejaData.Correo,
        subject: 'Respuesta a tu queja',
        html: QuejaRespondidaMail(quejaData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando respuesta de queja:', error);
      throw error;
    }
  }


  // SUGERENCIAS
  async enviarEmailSugerencia(sugerenciaData: {
    Correo?: string;
    Mensaje?: string;
    adjuntos?: string[];
  }) {
    if (!sugerenciaData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: sugerenciaData.Correo,
        subject: 'Confirmación de recepción de tu sugerencia',
        html: SugerenciaMail(sugerenciaData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando sugerencia:', error);
      throw error;
    }
  }

  async enviarEmailRespuestaSugerencia(sugerenciaData: {
    Correo?: string;
    Mensaje?: string;
    respuesta?: string;
  }) {
    if (!sugerenciaData.Correo) {
      throw new Error('Correo destinatario no proporcionado');
    }

    try {
      await this.mailerService.sendMail({
        to: sugerenciaData.Correo,
        subject: 'Respuesta a tu sugerencia',
        html: SugerenciaRespondidaMail(sugerenciaData),
        attachments: this.getLogoAttachment(),
      });
    } catch (error) {
      console.error('Error enviando respuesta de sugerencia:', error);
      throw error;
    }
  }
}