import {
    Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { GoogleDriveService } from './googleDriveFiles.service';

@Controller('upload')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
        },
      }),
    }),
  )

  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.googleDriveService.uploadFile(file);
  }

  @Post('upload')
    test(@Body() body: any) {
    return { recibido: body };
}
}
