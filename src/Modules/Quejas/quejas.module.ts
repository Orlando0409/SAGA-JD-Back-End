import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuejasController } from './quejas.controller';
import { QuejasService } from './quejas.service';
import { Queja } from './QuejaEntities/Queja.Entity';
import { EstadoQueja } from './QuejaEntities/EstadoQueja.Entity';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Queja, EstadoQueja]), DropboxModule, EmailModule],
  controllers: [QuejasController],
  providers: [QuejasService],
})
export class QuejasModule { }
