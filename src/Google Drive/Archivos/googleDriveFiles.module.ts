import { Module } from '@nestjs/common';
import { GoogleDriveFilesService } from './googleDriveFiles.service';
import { GoogleDriveController } from './googleDriveFiles.controller';

@Module({
  controllers: [GoogleDriveController],
  providers: [GoogleDriveFilesService],
  exports: [GoogleDriveFilesService],
})  
export class GoogleDriveModule {}