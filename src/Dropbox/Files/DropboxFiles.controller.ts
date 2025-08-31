import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DropboxFilesService } from './DropboxFiles.service';
import { CreateDropboxFileDto } from '../DropboxFilesDTO\'s/CreateDropboxFile.dto';

@Controller('dropbox')
export class DropboxController {
  constructor(private readonly DropboxFilesService: DropboxFilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile( @UploadedFile() file: Express.Multer.File, @Body() body: CreateDropboxFileDto) {
    return this.DropboxFilesService.uploadFile(file, body);
  }
}