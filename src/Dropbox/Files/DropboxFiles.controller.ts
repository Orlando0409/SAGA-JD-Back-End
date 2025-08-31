import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DropboxService } from './DropboxFiles.service';

@Controller('dropbox')
export class DropboxController {
  constructor(private readonly DropboxService: DropboxService) {}

@Post('upload/planos')
  @UseInterceptors(FileInterceptor('planos'))
  async uploadFilePlanos(@UploadedFile() file: Express.Multer.File) {
    return this.DropboxService.uploadFilePlanos(file);
  }
    
  @Post('upload/escrituras')
  @UseInterceptors(FileInterceptor('escrituras'))
  async uploadFileEscrituras(@UploadedFile() file: Express.Multer.File) {
    return this.DropboxService.uploadFileEscrituras(file);
  }
}