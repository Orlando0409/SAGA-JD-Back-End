import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveFilesService } from './googleDriveFiles.service';

@Controller('drive')
export class GoogleDriveController {
  constructor(private readonly GoogleDriveFilesService: GoogleDriveFilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.GoogleDriveFilesService.uploadFile(file);
  }
}
