import { BadRequestException, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import { DropboxAuthService } from '../DropboxAuth.service';
import * as sharp from 'sharp';
import heicConvert from 'heic-convert';
import { extname } from 'path';

@Injectable()
export class DropboxFilesService {
  constructor(private readonly dropboxAuthService: DropboxAuthService) {
    this.getDropboxInstance();
  }
  

  private async getDropboxInstance(): Promise<Dropbox> {
  const accessToken = await this.dropboxAuthService.getAccessToken();
  if (!accessToken) throw new Error('Token de acceso de Dropbox no disponible');
  return new Dropbox({ accessToken });
}

  async getPublicUrl(path: string): Promise<string> {
    const dbx = await this.getDropboxInstance();

    const link = await dbx.sharingCreateSharedLinkWithSettings({ path });
    return link.result.url.replace('?dl=0', '?raw=1');
  }

  private getFileType(filename: string): string {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (['.pdf'].includes(extension)) return 'document';
    if (['.jpg', '.jpeg', '.png', '.heif', '.bmp', '.webp', '.heic'].includes(extension)) return 'image';
    if (['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'].includes(extension)) return 'text';
    if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(extension)) return 'office';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension)) return 'archive';
    return 'other';
  }

  private readonly previewableExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'
  ];

  private canPreview(filename: string): boolean {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.previewableExtensions.includes(extension);
  }

  // Método para validar archivos permitidos
  private validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No se ha recibido ningún archivo');

    const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.docx', '.xls', '.xlsx'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedExt.includes(ext)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido (${ext}). Solo se permiten: ${allowedExt.join(', ')}`
      );
    }

    if (file.size > 20 * 1024 * 1024) throw new BadRequestException('El archivo no debe superar los 20 MB');
  }

  async uploadFile(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string, soloDescargar?: boolean) {
    try {
      // Validar el archivo antes de procesar
      this.validateFile(file);

      const shouldAllowPreview = soloDescargar ?? this.canPreview(file.originalname);
      const folderPath = process.env.DROPBOX_FOLDER_PATH;
      let dropboxPath: string;
      const baseFolder = carpetaSecundaria ? `${folderPath}/${carpetaPrincipal}/${carpetaSecundaria}` : `${folderPath}/${carpetaPrincipal}`;

      if (Identificacion) {
        dropboxPath = Nombre && Nombre.trim() !== ''
          ? `${baseFolder}/${Identificacion} - ${Nombre}/${file.originalname}`
          : `${baseFolder}/${Identificacion}/${file.originalname}`;
      } else {
        dropboxPath = Nombre && Nombre.trim() !== ''
          ? `${baseFolder}/${Nombre}/${file.originalname}`
          : `${baseFolder}/${file.originalname}`;
      }

      // Procesamiento de imagen si es aplicable
      const isImage = this.getFileType(file.originalname) === 'image';
      let processedBuffer = file.buffer;

      //
      if (isImage) {

        const MAX_SIZE_MB = 3;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        let bufferToProcess = file.buffer;

        // Conversión HEIC → JPEG
        if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif' || file.originalname.toLowerCase().endsWith('.heic')) {

          // Convertir HEIC a JPEG antes de cualquier otro procesamiento
          bufferToProcess = await heicConvert({
            buffer: file.buffer,
            format: 'JPEG',
            quality: 1
          });
          file.originalname = file.originalname.replace(/\.[^.]+$/, '.jpg');
        }


        // Reducción de tamaño y conversión a WebP
        let quality = 90;
        if (bufferToProcess.length > MAX_SIZE_BYTES) {
          quality = 75;
        }

        // Procesar imagen con Sharp
        processedBuffer = await sharp(bufferToProcess)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();

        file.originalname = file.originalname.replace(/\.[^.]+$/, '.webp');
      }

      const dbx = await this.getDropboxInstance();

      const uploadRes = await dbx.filesUpload({
        path: dropboxPath,
        contents: processedBuffer,
        mode: { '.tag': 'overwrite' },
      });

      let sharedLink;
      try {
        sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
      } catch (error: any) {
        if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
          const listLinks = await dbx.sharingListSharedLinks({ path: dropboxPath, direct_only: true });
          if (listLinks.result.links.length > 0) sharedLink = { result: listLinks.result.links[0] };
        } else throw error;
      }

      let url: string;
      let viewUrl: string | null = null;

      if (shouldAllowPreview) {
        viewUrl = sharedLink.result.url;
        url = sharedLink.result.url.replace('dl=0');
      } else {
        url = sharedLink.result.url.replace('dl=0', 'dl=1');
      }

      return {
        id: uploadRes.result.id,
        name: uploadRes.result.name,
        size: uploadRes.result.size,
        path: dropboxPath,
        url,
        viewUrl,
        allowPreview: shouldAllowPreview,
        fileType: this.getFileType(file.originalname)
      };

    } catch (error) {
      console.error('Error subiendo archivo a Dropbox:', error);
      throw error;
    }
  }



  async replaceFileInSameFolder(file: Express.Multer.File, existingFilePath: string) {
    // Validar el archivo antes de procesar
    this.validateFile(file);

    const dbx = await this.getDropboxInstance();

    // Extraer la carpeta del archivo actual
    const folderPath = existingFilePath.substring(0, existingFilePath.lastIndexOf('/'));

    // Reutilizar el mismo nombre del nuevo archivo o el existente
    const newPath = `${folderPath}/${file.originalname}`;

    try {
      const uploadRes = await dbx.filesUpload({
        path: newPath,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' }, // sobrescribe el anterior
      });

      // Intentar obtener o crear link compartido
      let sharedLink;
      try {
        sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: newPath });
      } catch (error: any) {
        if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
          const listLinks = await dbx.sharingListSharedLinks({
            path: newPath,
            direct_only: true,
          });
          if (listLinks.result.links.length > 0) {
            sharedLink = { result: listLinks.result.links[0] };
          }
        } else {
          throw error;
        }
      }

      // Generar URLs
      const viewUrl = sharedLink.result.url;
      const downloadUrl = sharedLink.result.url.replace('dl=0', 'dl=1');

      return {
        id: uploadRes.result.id,
        name: uploadRes.result.name,
        size: uploadRes.result.size,
        path: newPath,
        url: downloadUrl,
        viewUrl,
      };
    } catch (error) {
      console.error('Error reemplazando archivo en Dropbox:', error);
      throw error;
    }
  }



  async updateFile(oldPath: string, newPath: string) {
    const dbx = await this.getDropboxInstance();

    try {
      const result = await dbx.filesMoveV2({
        from_path: oldPath,
        to_path: newPath,
      });

      return {
        message: 'Archivo actualizado correctamente',
        metadata: result.result.metadata,
      };
    } catch (error) {
      console.error('Error actualizando archivo en Dropbox:', error);
      throw new Error('No se pudo actualizar el archivo');
    }
  }

  // Eliminar una carpeta o ruta en Dropbox construida igual que en uploadFile
  async deletePath(carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string) {
    const dbx = await this.getDropboxInstance();
    const folderPath = process.env.DROPBOX_FOLDER_PATH;
    const baseFolder = carpetaSecundaria ? `${folderPath}/${carpetaPrincipal}/${carpetaSecundaria}` : `${folderPath}/${carpetaPrincipal}`;

    let dropboxPath: string;
    if (Identificacion) {
      if (Nombre && Nombre.toString().trim() !== '') { dropboxPath = `${baseFolder}/${Identificacion} - ${Nombre}`; }
      else { dropboxPath = `${baseFolder}/${Identificacion}`; }
    }

    else {
      if (Nombre && Nombre.toString().trim() !== '') { dropboxPath = `${baseFolder}/${Nombre}`; }
      else { dropboxPath = baseFolder; }
    }

    try {
      await dbx.filesDeleteV2({ path: dropboxPath });
      return { deleted: true, path: dropboxPath };
    }

    catch (error: any) {
      // Si la ruta no existe, tratar como éxito silencioso
      const errString = JSON.stringify(error || {});
      if (errString.includes('not_found') || errString.includes('path')) {
        return { deleted: false, path: dropboxPath, reason: 'not_found' };
      }
      console.error('Error eliminando ruta en Dropbox:', error);
      throw error;
    }
  }

  // Método específico para archivos que solo permiten descarga
  async uploadFileDownloadOnly(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string) {
    return this.uploadFile(file, carpetaPrincipal, carpetaSecundaria, Identificacion, Nombre, false);
  }

  // Método específico para archivos que permiten previsualización
  async uploadFileWithPreview(file: Express.Multer.File, carpetaPrincipal: string, carpetaSecundaria?: string, Identificacion?: string, Nombre?: string) {
    return this.uploadFile(file, carpetaPrincipal, carpetaSecundaria, Identificacion, Nombre, true);
  }

  async deleteFile(path: string) {
    const dbx = await this.getDropboxInstance();

    try {
      await dbx.filesDeleteV2({ path });
      return { deleted: true, path };

    } 
    catch (error: any) {
      const errString = JSON.stringify(error || {});
      if (errString.includes('El archivo no existe') || errString.includes('path')){
        return { deleted: false, path, reason: 'El archivo no existe' };
      }
      console.error('Error eliminando archivo en Dropbox:', error);
      throw error;
    }
    
  }
}