import { Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import fetch from 'node-fetch';

@Injectable()
export class DropboxService {
  private dbx: Dropbox;

  constructor() {
    this.dbx = new Dropbox({
      accessToken: process.env.DROPBOX_ACCESS_TOKEN,
      fetch
    });
  }

  async uploadFilePlanos(file: Express.Multer.File) {
    try {
      const response = await this.dbx.filesUpload({
        path: `/SAGA-JD/Planos-Terrenos/${file.originalname}`, // ruta en Dropbox
        contents: file.buffer,
      });

      return response.result;
    } catch (error) {
      throw error;
    }
  }

  async uploadFileEscrituras(file: Express.Multer.File) {
    try {
      const response = await this.dbx.filesUpload({
        path: `/SAGA-JD/Escrituras-Terrenos/${file.originalname}`, // ruta en Dropbox
        contents: file.buffer,
      });

      return response.result;
    } catch (error) {
      throw error;
    }
  }
}