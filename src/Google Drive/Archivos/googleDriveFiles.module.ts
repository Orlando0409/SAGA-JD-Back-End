import { Module } from '@nestjs/common';
import { GoogleDriveService } from './googleDriveFiles.service';
import { GoogleDriveController } from './googleDriveFiles.controller';

@Module({
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
})

export class GoogleDriveModule {}