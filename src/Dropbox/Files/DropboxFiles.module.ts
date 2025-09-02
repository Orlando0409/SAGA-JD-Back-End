import { Module } from '@nestjs/common';
import { DropboxFilesService } from './DropboxFiles.service';
import { DropboxController } from './DropboxFiles.controller';
import { DropboxAuthService } from '../DropboxAuth.service';

@Module({
  providers: [DropboxFilesService, DropboxAuthService],
  controllers: [DropboxController],
  exports: [DropboxFilesService],
})

export class DropboxModule {}