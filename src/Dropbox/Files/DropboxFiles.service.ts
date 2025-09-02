import { Body, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import fetch from 'node-fetch';

@Injectable()
export class DropboxFilesService {
  private dbx: Dropbox;

  constructor() {
    this.dbx = new Dropbox({
      accessToken: process.env.DROPBOX_ACCESS_TOKEN,
      fetch
    });
  }

  async uploadFile(file: Express.Multer.File, carpeta: string, cedula?: string) {
    try {
      if (!file) {
        throw new Error('No se ha recibido ningún archivo');
      }

      const folderPath = process.env.DROPBOX_FOLDER_PATH;

      // 📂 Construcción de la ruta en Dropbox
      let dropboxPath = cedula
        ? `${folderPath}/${carpeta}/${cedula}/${file.originalname}`
        : `${folderPath}/${carpeta}/${file.originalname}`;

      // 🚀 Subir archivo a Dropbox
      const uploadRes = await this.dbx.filesUpload({
        path: dropboxPath,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' },
      });

      // 🔗 Intentar crear un link compartido
      let sharedLink;
      try {
        sharedLink = await this.dbx.sharingCreateSharedLinkWithSettings({
          path: dropboxPath,
        });
      } catch (error: any) {
        // Caso especial: si ya existe el link
        if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
          const listLinks = await this.dbx.sharingListSharedLinks({
            path: dropboxPath,
            direct_only: true,
          });

          if (listLinks.result.links.length > 0) {
            sharedLink = { result: listLinks.result.links[0] };
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      // 🔄 Convertir link en descarga directa
      const url = sharedLink.result.url.replace('?dl=0', '?dl=1');

      // 📦 Respuesta final
      return {
        id: uploadRes.result.id,
        name: uploadRes.result.name,
        size: uploadRes.result.size,
        path: dropboxPath,
        url, // 👈 directo para guardar en BD
      };
    } catch (error) {
      console.error('Error subiendo archivo a Dropbox:', error);
      throw error;
    }
  }
}