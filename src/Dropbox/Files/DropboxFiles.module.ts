import { Module } from '@nestjs/common';
import { DropboxFilesService } from './DropboxFiles.service';
import { DropboxController } from './DropboxFiles.controller';

@Module({
  providers: [DropboxFilesService],
  controllers: [DropboxController],
})

export class DropboxModule {}