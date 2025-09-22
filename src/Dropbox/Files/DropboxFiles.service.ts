import { Body, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import { DropboxAuthService } from '../DropboxAuth.service';

@Injectable()
export class DropboxFilesService {
  constructor
  (
    private readonly dropboxAuthService: DropboxAuthService,
  ) {}

  // 📋 Extensiones que permiten previsualización
  private readonly previewableExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'
  ];

  // 🔍 Método para verificar si un archivo puede ser previsualizado
  private canPreview(filename: string): boolean {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.previewableExtensions.includes(extension);
  }

  // 📂 Método para obtener el tipo de archivo
  private getFileType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    if (['.pdf'].includes(extension)) return 'document';
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)) return 'image';
    if (['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'].includes(extension)) return 'text';
    if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(extension)) return 'office';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension)) return 'archive';
    
    return 'other';
  }

  async uploadFile(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string, soloDescargar?: boolean) {

    const accessToken = await this.dropboxAuthService.getAccessToken();
    const dbx = new Dropbox({ accessToken });

    if (!accessToken) {
      throw new Error('Dropbox access token is not available');
    }

    try {
      if (!file) {
        throw new Error('No se ha recibido ningún archivo');
      }

      // 🔍 Determinar si permitir previsualización (automático si no se especifica)
      const shouldAllowPreview = soloDescargar ?? this.canPreview(file.originalname);

      const folderPath = process.env.DROPBOX_FOLDER_PATH;

      // 📂 Construcción de la ruta en Dropbox
      let dropboxPath = Identificacion
        ? `${folderPath}/${carpetaPrincipal}/${carpetaSecundaria}/${Identificacion} - ${Nombre}/${file.originalname}`
        : `${folderPath}/${carpetaPrincipal}/${file.originalname}`;

      // 🚀 Subir archivo a Dropbox
      const uploadRes = await dbx.filesUpload({
        path: dropboxPath,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' },
      });

      // 🔗 Intentar crear un link compartido
      let sharedLink;
      try {
        sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
          path: dropboxPath,
        });
      } catch (error: any) {
        // Caso especial: si ya existe el link
        if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
          const listLinks = await dbx.sharingListSharedLinks({
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

      // 🔄 Generar el tipo de link apropiado según shouldAllowPreview
      let url: string;
      let viewUrl: string | null = null;
      
      if (shouldAllowPreview) {
        // Para previsualización: mantener dl=0 para ver en navegador
        viewUrl = sharedLink.result.url; // Link para previsualizar
        url = sharedLink.result.url.replace('dl=0'); // Link para descargar
      } else {
        // Solo descarga: forzar descarga directa
        url = sharedLink.result.url.replace('dl=0', 'dl=1');
      }

      // 📦 Respuesta final
      return {
        id: uploadRes.result.id,
        name: uploadRes.result.name,
        size: uploadRes.result.size,
        path: dropboxPath,
        url, // 👈 Link de descarga directa
        viewUrl, // 👈 Link de previsualización (null si no se permite)
        allowPreview: shouldAllowPreview,
        fileType: this.getFileType(file.originalname)
      };
    } catch (error) {
      console.error('Error subiendo archivo a Dropbox:', error);
      throw error;
    }
  }

  // 📥 Método específico para archivos que solo permiten descarga
  async uploadFileDownloadOnly(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string) {
    return this.uploadFile(file, carpetaPrincipal, carpetaSecundaria, Identificacion, Nombre, false);
  }

  // 👁️ Método específico para archivos que permiten previsualización
  async uploadFileWithPreview(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string) {
    return this.uploadFile(file, carpetaPrincipal, carpetaSecundaria, Identificacion, Nombre, true);
  }
}