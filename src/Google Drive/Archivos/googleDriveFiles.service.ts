import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { drive } from 'googleapis/build/src/apis/drive';
import * as path from 'path';
import * as stream from 'stream';

@Injectable()
export class GoogleDriveFilesService {
  private driveClient;

  constructor() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
    
    this.driveClient = google.drive({ version: 'v3', auth });
  } 

  async uploadFile(file: Express.Multer.File) {
    const folderId = process.env.SAGA_JD_FOLDER_ID;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    await this.driveClient.files.list({ pageSize: 1 });
    console.log('Autenticación correcta');

    const response = await this.driveClient.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId],
        driveId: folderId,
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    await this.driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return response.data;
  }
}