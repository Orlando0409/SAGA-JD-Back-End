import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private oauth2Client;

  constructor(private config: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.get('GMAIL_CLIENT_ID'),
      this.config.get('GMAIL_CLIENT_SECRET'),
      this.config.get('GMAIL_REDIRECT_URI'),
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.config.get('GMAIL_REFRESH_TOKEN'),
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const accessToken = await this.oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.config.get('GMAIL_USER'),
        clientId: this.config.get('GMAIL_CLIENT_ID'),
        clientSecret: this.config.get('GMAIL_CLIENT_SECRET'),
        refreshToken: this.config.get('GMAIL_REFRESH_TOKEN'),
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `ASADA Juan Díaz <${this.config.get('GMAIL_USER')}>`,
      to,
      subject,
      text,
      html,
    };

    return await transporter.sendMail(mailOptions);
  }
}
