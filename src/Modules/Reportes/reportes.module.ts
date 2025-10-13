import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reporte } from './ReporteEntities/Reporte.Entity';
import { EstadoReporte } from './ReporteEntities/EstadoReporte.Entity';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { DropboxAuthService } from 'src/Dropbox/DropboxAuth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte, EstadoReporte])],
  providers: [ReportesService, DropboxFilesService, DropboxAuthService],
  controllers: [ReportesController],
})
export class ReportesModule {}
