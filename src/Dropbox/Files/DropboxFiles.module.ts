import { Module } from '@nestjs/common';
import { DropboxService } from './DropboxFiles.service';
import { DropboxController } from './DropboxFiles.controller';

@Module({
  providers: [DropboxService],
  controllers: [DropboxController],
})

export class DropboxModule {}