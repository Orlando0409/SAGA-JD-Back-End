import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { ReportesEntity } from './ReportesEntity/ReportesEntity';
import { EstadoReporte } from './ReportesEntity/EstadoReporte';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { DropboxAuthService } from 'src/Dropbox/DropboxAuth.service';
import { EmailModule } from 'src/Modules/Emails/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReportesEntity, EstadoReporte]), EmailModule],
  providers: [ReportesService, DropboxFilesService, DropboxAuthService],
  controllers: [ReportesController],
})
export class ReportesModule {}
