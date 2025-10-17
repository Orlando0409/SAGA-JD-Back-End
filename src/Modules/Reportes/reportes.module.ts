import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReportesEntity } from './ReportesEntity/ReportesEntity';
import { EstadoReporte } from './ReportesEntity/EstadoReporte';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportesEntity, EstadoReporte]), 
    DropboxModule,
    EmailModule
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
