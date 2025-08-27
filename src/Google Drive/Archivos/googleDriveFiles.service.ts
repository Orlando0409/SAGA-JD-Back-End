import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as stream from 'stream';

@Injectable()
export class GoogleDriveService {
  private driveClient;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'C:\Users\andre\Desktop\Cursos UNA\Ciclo II 2025\Ingenieria II\Claves-Google-Drive.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async uploadFile(file: Express.Multer.File) {
    const folderId = process.env.SAGA_JD_FOLDER_ID;

    // Convertir buffer del archivo a stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    const response = await this.driveClient.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    // Hacer que el archivo sea accesible públicamente (opcional)
    await this.driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return response.data;
  }
}
