import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';
import { SugerenciaEntity } from './SugerenciaEntities/Sugerencia.Entity';
import { Estado_Sugerencia } from './SugerenciaEntities/EstadoSugerencia';

@Module({
  imports: [
    TypeOrmModule.forFeature([SugerenciaEntity, Estado_Sugerencia]), 
    DropboxModule,
    EmailModule
  ],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}