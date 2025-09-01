import { Module } from '@nestjs/common';
import { DropboxFilesService } from './DropboxFiles.service';
import { DropboxController } from './DropboxFiles.controller';

@Module({
  providers: [DropboxFilesService],
  controllers: [DropboxController],
  exports: [DropboxFilesService],
})

export class DropboxModule {}