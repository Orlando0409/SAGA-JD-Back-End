import { Module } from '@nestjs/common';
import { GoogleDriveFilesService } from './googleDriveFiles.service';
import { GoogleDriveController } from './googleDriveFiles.controller';

@Module({
  controllers: [GoogleDriveController],
  providers: [GoogleDriveFilesService],
})

export class GoogleDriveModule {}