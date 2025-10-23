import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';
import { Reporte } from './ReporteEntities/Reporte.Entity';
import { EstadoReporte } from './ReporteEntities/EstadoReporte.Entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, EstadoReporte]),
    DropboxModule,
    EmailModule
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule { }
