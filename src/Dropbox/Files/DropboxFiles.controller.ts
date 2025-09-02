import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DropboxFilesService } from './DropboxFiles.service';

@Controller('dropbox')
export class DropboxController {
  constructor(private readonly DropboxFilesService: DropboxFilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile( @UploadedFile() file: Express.Multer.File, carpeta: string, cedula: string) {
    return this.DropboxFilesService.uploadFile(file, carpeta, cedula);
  }
}