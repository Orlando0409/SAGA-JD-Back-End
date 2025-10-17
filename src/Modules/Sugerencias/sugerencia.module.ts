import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';
import { Sugerencia } from './Entity/Sugerencia.Entity';
import { EstadoSugerencia } from './Entity/EstadoSugerencia';


@Module({
  imports: [
    TypeOrmModule.forFeature([Sugerencia, EstadoSugerencia]), 
    DropboxModule,
    EmailModule
  ],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}