import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DropboxAuthService {
  private accessToken!: string;
  private tokenExpiry: number | null = null; // epoch time (ms)
  private readonly logger = new Logger(DropboxAuthService.name);

  constructor() { }

  async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) return this.accessToken;

    this.logger.log('Access token expirado o no inicializado, refrescando...');

    try {
      const res = await axios.post(
        'https://api.dropboxapi.com/oauth2/token',
        new URLSearchParams({
          refresh_token: process.env.DROPBOX_REFRESH_TOKEN!,
          grant_type: 'refresh_token',
          client_id: process.env.DROPBOX_APP_KEY!,
          client_secret: process.env.DROPBOX_APP_SECRET!,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const data = res.data;

      this.accessToken = data.access_token;
      this.tokenExpiry = now + data.expires_in * 1000;

      this.logger.log(`Nuevo access token obtenido, válido por ${data.expires_in} segundos`);
      return this.accessToken;

    } catch (error: any) {
      this.logger.error('Error al refrescar el token de Dropbox:', error.response?.data || error.message);
      throw new Error('No se pudo obtener un nuevo token de Dropbox. Verifica tus credenciales o refresh_token.');
    }
  }
}
