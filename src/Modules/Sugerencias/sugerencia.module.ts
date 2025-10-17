import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';
import { SugerenciaEntity } from './Entity/SugerenciaEntity';
import { Estado_Sugerencia } from './Entity/EstadoSugerencia';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';

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